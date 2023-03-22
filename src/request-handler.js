/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {
  ContextHelper,
  QueueClient,
  RestError,
  // eslint-disable-next-line no-unused-vars
  contextHelper,
} from '@adobe/content-lake-commons';
import wrap from '@adobe/helix-shared-wrap';
import { helixStatus } from '@adobe/helix-status';
import { logger } from '@adobe/helix-universal-logger';

/**
 * @callback HandlerFn
 * @param {Record<string,any>} event the event to handle
 * @param {contextHelper.UniversalishContext} context the current context
 * @returns {Promise<Response>} the response from handling the request
 */

/**
 * A "wrapper" that handles requests for an extractor. The service interface
 * provides capabilities that allow the extractor to be executed and configured
 * through HTTP requests either using POST parameters or via SQS Records
 */
export class RequestHandler {
  static ACTION_EXTRACT = 'extract';

  static ACTION_CALLBACK = 'callback';

  static ACTION_AUTHENTICATE = 'authenticate';

  /**
   * @type {HandlerFn}
   */
  #handlers = {};

  /**
   * Registers an action handler, replacing the existing handler (if any)
   * @param {string} action the action name
   * @param {function(any):Promise<Response>} handler the handler function
   * @returns {RequestHandler}
   */
  withHandler(action, handler) {
    this.#handlers[action] = handler;
    return this;
  }

  /**
   * Gets the main function for the extractor
   * @returns {function(Request,UniversalContext):Promise<Response>} the main function
   */
  getMain() {
    return wrap(async (request, context) => {
      const helper = new ContextHelper(context);
      const log = helper.getLog();
      let res;
      const { method, url } = request;
      const loggableRequest = {
        method,
        url,
        headers: Object.fromEntries(request.headers),
        invocation: context?.invocation,
        event: helper.extractOriginalEvent(),
      };
      const start = Date.now();
      try {
        log.info(`> ${method} ${url}`);
        log.debug('Handing request', loggableRequest);
        res = await this.handleRequest(context);
      } catch (err) {
        log.warn('Exception handling request', { ...loggableRequest, err });
        res = RestError.toProblemResponse(err);
      }
      log.info(`< ${method} ${res.status} ${url} ${Date.now() - start}ms`);
      return res;
    })
      .with(helixStatus)
      .with(logger.trace)
      .with(logger);
  }

  /**
   * Get the queue client for the specified request
   * @param {any} context  Context for the current execution is running.
   * @returns {QueueClient} the queue client
   */
  // eslint-disable-next-line class-methods-use-this
  getQueueClient(context) {
    const helper = new ContextHelper(context);
    const queueUrl = context.env.QUEUE_URL;
    if (!queueUrl) {
      throw new Error('Missing ENV variable QUEUE_URL');
    }
    return new QueueClient({
      ...helper.extractAwsConfig(context),
      queueUrl,
    });
  }

  /**
   * Handles a request that comes into an extractor's HTTP service.
   * @param {any} context Context for the current execution is running.
   * @returns {Promise<Reponse>} Resolves with the response that the service
   *  will provide
   */
  async handleRequest(context) {
    const helper = new ContextHelper(context);
    const log = helper.getLog();

    if (helper.isSqsRequest()) {
      const queueClient = this.getQueueClient(context);
      const records = helper.extractSqsRecords();
      log.debug('Handing SQS records', { count: records.length });
      await Promise.all(
        records.map((qr) => this.handleSqsRecord(context, qr, queueClient, log)),
      );
      return new Response();
    } else {
      log.debug('Handing POST payload');
      const event = helper.extractOriginalEvent();
      return this.handleEvent(event, context);
    }
  }

  /**
   * Handles a single event
   * @param {Record<string,any>} event the event to handle
   * @param {contextHelper.UniversalishContext} context the current context
   * @returns {Promise<Response>} the response from handling the event
   */
  async handleEvent(event, context) {
    const { action } = event;
    if (!action) {
      throw new RestError(400, 'Missing parameter [action]');
    }
    if (!this.#handlers[action]) {
      throw new RestError(400, `Invalid action [${action}]`);
    }
    return this.#handlers[action](event, context);
  }

  /**
   * Handles a SQS event record
   * @param {contextHelper.UniversalishContext} context
   * @param {contextHelper.QueueRecord} record
   * @param {QueueClient} queueClient
   * @param {contextHelper.Logger} log
   * @returns {Promise<void>}
   */
  async handleSqsRecord(context, record, queueClient, log) {
    try {
      log.debug('Handling SQS record', {
        record,
      });
      const event = JSON.parse(record.body);
      const res = await this.handleEvent(event, context);
      if (res.ok) {
        log.debug('Record handled successfully, removing from queue', {
          record,
        });
        await queueClient.removeMessage(record.receiptHandle);
      } else {
        log.warn('Record handling unsuccessful', {
          record,
          res,
        });
      }
    } catch (err) {
      log.warn('Failed to handle SQS record', { record, err });
    }
  }
}
