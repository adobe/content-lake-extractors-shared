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

import URL from 'url';

import {
  Methods,
  StatusCodes,
  StatusTexts,
  Headers,
  ContentTypes,
} from './constants.js';
import { extractCredentials } from './context.js';
import { LoggingSupport } from './logging-support.js';
import { ExtractError } from './extract-error.js';
import { ExtractProcess } from './extract-process.js';

const ACTION_EXTRACT = 'extract';

const HEALTH_CHECK = '/healthcheck';

const DEFAULT_PROBLEM_DETAIL = 'The Extractor service encountered an unexpected error';

/**
 * @typedef HttpServiceResponse
 * @property {string} [body] Raw body of a response from the service. Default
 *  is an empty body.
 * @property {*} [headers] Simple object whose keys are header names
 *  and whose values are header values. Default is no headers.
 * @property {number} [status] Status code of the response. Default is 200.
 */

/**
 * @typedef HttpServiceConfig
 * @property {import('./extractors.js').Extractor} extractor The extractor that will
 *  perform the service's work.
 * @property {import('./ingestor.js').IngestorClient} [ingestorClient] If
 *  provided, the ingestor client that the service will use
 *  to ingest assets. Will default to the shared library's ingestor.
 * @property {import('./functions.js').FunctionRunner} [functionRunner] If
 *  provided, the function runner that the service will use
 *  to queue additional extraction requests. Will default to the shared
 *  library's function runner.
 */

/**
 * A "wrapper" that adds an HTTP interface on an extractor. The service interface
 * provides capabilities that allow the extractor to be executed and configured
 * through HTTP requests.
 */
export class HttpService {
  /**
   * @type {import('./extractors.js').Extractor}
   */
  #extractor;

  /**
   * @type {import('./ingestor.js').IngestorClient}
   */
  #ingestorClient;

  /**
   * @type {import('./functions.js').FunctionRunner}
   */
  #functionRunner;

  /**
   * Constructs a new instance of an HTTP service that will use the given configuration.
   * @param {HttpServiceConfig} config Configuration for the service, including the
   *  extractor that it will use to perform its operations.
   */
  constructor(config) {
    this.#extractor = config?.extractor;
    this.#ingestorClient = config?.ingestorClient;
    this.#functionRunner = config?.functionRunner;
  }

  /**
   * Given an execution context, retrieves the logger that the service should use to log
   * messages.
   * @param {import('@adobe/helix-universal').UniversalContext} context Context under
   *  which the current execution is running.
   * @returns {import('./logging-support.js').Logger} A logger for the service.
   */
  static getLogger(context) {
    return new LoggingSupport(context).getLogger();
  }

  /**
   * Retrieves the ingestor API key associated with the current request.
   * @param {import('@adobe/helix-universal').UniversalContext} context Context under
   *  which the current execution is running.
   * @returns {string} An API key.
   */
  static getIngestorApiKey(context) {
    const apiKey = context.env.INGESTOR_API_KEY;
    if (!apiKey) {
      throw ExtractError.badRequest('Extractor services require an ingestor API key');
    }
    return apiKey;
  }

  /**
   * Retrieves the ingestor URL associated with the current request.
   * @param {import('@adobe/helix-universal').UniversalContext} context Context under
   *  which the current execution is running.
   * @returns {string} A URL.
   */
  static getIngestorUrl(context) {
    const url = context.env.INGESTOR_URL;
    if (!url) {
      throw ExtractError.badRequest('Extractor services require an ingestor URL');
    }
    return url;
  }

  /**
   * Retrieves the underlying extractor that the service will use to perform extraction
   * operations.
   * @returns {import('./extractors.js').Extractor} The extractor that the service is
   *  using.
   */
  #getExtractor() {
    if (!this.#extractor) {
      throw ExtractError.internalServerError('HTTP service is missing an extractor.');
    }
    return this.#extractor;
  }

  /**
   * Does the work of generating a response to a request, including handling any
   * errors.
   * @param {*} request An HTTP fetch request that was sent to the handler and
   *  should be processed.
   * @param {import('@adobe/helix-universal').UniversalContext} context Context under
   *  which the current execution is running.
   * @returns {HttpServiceResponse} The response that service will provide.
   */
  async generateResponse(request, context) {
    const log = HttpService.getLogger(context);
    let response;
    try {
      const {
        method,
        url,
      } = request;
      log.info(`> ${method} ${url}`);

      const { pathname } = URL.parse(url);
      if (String(pathname).endsWith(HEALTH_CHECK) && method === Methods.GET) {
        response = { status: StatusCodes.OK };
      } else if (method === Methods.POST) {
        response = await this.handleRequest(request, context);
      } else {
        throw ExtractError.badRequest('Unsupported method');
      }
      const { status = StatusCodes.OK } = response;
      log.info(`< ${method} ${status} ${url}`);
    } catch (e) {
      response = HttpService.handleError(request, context, e);
    }
    return response;
  }

  /**
   * Sends an error that was encountered during the extraction process. Provides
   * an appropriate HTTP response.
   * @param {*} request An HTTP fetch request that was sent to the handler and
   *  should be processed.
   * @param {import('@adobe/helix-universal').UniversalContext} context Context under
   *  which the current execution is running.
   * @param {*} err Error that was generated by the process.
   * @returns {HttpServiceResponse} An HTTP response.
   */
  static handleError(request, context, err) {
    const {
      status = StatusCodes.INTERNAL_SERVER_ERROR,
      title = StatusTexts.INTERNAL_SERVER_ERROR,
      message: detail = DEFAULT_PROBLEM_DETAIL,
    } = err;
    const {
      method,
      url,
    } = request;
    HttpService.getLogger(context).error(`< ${method} ${status} ${url}: ${detail}`, err);
    return {
      body: JSON.stringify({
        status,
        title,
        detail,
      }),
      headers: {
        [Headers.CONTENT_TYPE]: ContentTypes.PROBLEM,
      },
      status,
      statusText: title,
    };
  }

  /**
   * Handles a request that comes into an extractor's HTTP service.
   * @param {*} request A fetch HTTP request that was sent to the handler and should
   *  be processed.
   * @param {import('@adobe/helix-universal').UniversalContext} context Context under
   *  which the current execution is running.
   * @returns {Promise<*>} Resolves with the response body that the service
   *  will provide. The value will be converted to a JSON string.
   */
  async handleRequest(request, context) {
    const log = HttpService.getLogger(context);
    let body;
    try {
      body = await request.json();
    } catch (err) {
      throw ExtractError.badRequest(`Invalid JSON received in request: ${err.message}`);
    }

    const { action } = body;

    // extract is the only action that the service handles
    if (action === ACTION_EXTRACT) {
      const extractProcess = new ExtractProcess({
        extractor: this.#getExtractor(),
        log,
      }, this.#ingestorClient, this.#functionRunner);

      const credentials = extractCredentials(context.env);
      const responseBody = await extractProcess.extract({
        ...body,
        credentials: credentials.credentials,
        ingestorApiKey: HttpService.getIngestorApiKey(context),
        ingestorUrl: HttpService.getIngestorUrl(context),
        extractorId: context.func?.fqn,
      });
      return responseBody || {};
    }

    throw ExtractError.badRequest(`Invalid action ${action}`);
  }
}
