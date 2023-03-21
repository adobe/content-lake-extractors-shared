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

import { Response } from 'node-fetch';
import URL from 'url';
import {
  RestError,
} from '@adobe/content-lake-commons';

import {
  Methods,
  StatusCodes,
  ContentTypes,
  Headers,
} from './constants.js';
import { LoggingSupport } from './logging-support.js';
import { BatchExecutor } from './batch-executor.js';

const ACTION_EXTRACT = 'extract';

const HEALTH_CHECK = '/healthcheck';

/**
 * @typedef HttpServiceConfig
 * @property {import('./batch-provider').BaseBatchProvider} batchProvider The
 *  provider that will perform the service's work.
 */

/**
 * A "wrapper" that adds an HTTP interface on a batch provider. The service interface
 * provides capabilities that allow the provider to be executed and configured
 * through HTTP requests.
 */
export class HttpService extends LoggingSupport {
  /**
   * @type {import('./batch-provider').BaseBatchProvider}
   */
  #batchProvider;

  /**
   * Constructs a new instance of an HTTP service that will use the given configuration.
   * @param {HttpServiceConfig} config Configuration for the service, including the
   *  batchProvider that it will use to perform its operations.
   */
  constructor(config) {
    super(config);
    this.#batchProvider = config?.batchProvider;
  }

  /**
   * Retrieves the underlying provder that the service will use to perform batch
   * operations.
   * @returns {import('./batch-provider').BaseBatchProvider} The provider that the service
   *  is using.
   */
  #getBatchProvider() {
    if (!this.#batchProvider) {
      throw new RestError(StatusCodes.INTERNAL_SERVER_ERROR, 'HTTP service is missing a batch provider.');
    }
    return this.#batchProvider;
  }

  /**
   * Does the work of generating a response to a request, including handling any
   * errors.
   * @param {*} request An HTTP fetch request that was sent to the handler and
   *  should be processed.
   * @returns {Response} The response that service will provide.
   */
  async generateResponse(request) {
    const log = this.getLogger();
    let response;
    try {
      const {
        method,
        url,
      } = request;
      log.info(`> ${method} ${url}`);

      const { pathname } = URL.parse(url);
      if (String(pathname).endsWith(HEALTH_CHECK) && method === Methods.GET) {
        response = new Response();
      } else if (method === Methods.POST) {
        const responseBody = await this.handleRequest(request);
        response = new Response(JSON.stringify(responseBody));
        response.headers.append(Headers.CONTENT_TYPE, ContentTypes.JSON);
      } else {
        throw new RestError(StatusCodes.BAD_REQUEST, 'Unsupported method');
      }
      const { status = StatusCodes.OK } = response;
      log.info(`< ${method} ${status} ${url}`);
    } catch (e) {
      response = RestError.toProblemResponse(e);
    }
    return response;
  }

  /**
   * Handles a request that comes into an extractor's HTTP service.
   * @param {*} request A fetch HTTP request that was sent to the handler and should
   *  be processed.
   * @returns {Promise<*>} Resolves with the response body that the service
   *  will provide. The value will be converted to a JSON string.
   */
  async handleRequest(request) {
    const log = this.getLogger();
    let body;
    try {
      body = await request.json();
    } catch (err) {
      throw new RestError(StatusCodes.BAD_REQUEST, `Invalid JSON received in request: ${err.message}`);
    }

    const { action } = body;

    // extract is the only action that the service handles
    if (action === ACTION_EXTRACT) {
      const batchExecutor = new BatchExecutor(this.#getBatchProvider(), {
        log,
        ...body,
      });

      await batchExecutor.traverseTree(HttpService.getBatchItem(body));

      return batchExecutor.getState();
    }

    throw new RestError(StatusCodes.BAD_REQUEST, `Invalid action ${action}`);
  }

  /**
   * Retrieves the batch item currently being processed, as defined in the request
   * body.
   * @param {*} body Parsed JSON body.
   * @returns {string} Identifier for the batch to extract.
   */
  static getBatchItem(body) {
    const { batchItem } = body;
    if (!batchItem) {
      throw new RestError(StatusCodes.BAD_REQUEST, 'batchItem is required in request JSON');
    }
    return batchItem;
  }
}
