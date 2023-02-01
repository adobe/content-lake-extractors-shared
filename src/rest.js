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

import { randomUUID } from 'crypto';
import routington from 'routington';
import { Response } from '@adobe/fetch';

const STATUS_MESSAGES = {
  400: 'Bad Request',
  401: 'Unauthorized',
  402: 'Payment Required',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  406: 'Not Acceptable',
  407: 'Proxy Authentication Required',
  408: 'Request Timeout',
  409: 'Conflict',
  410: 'Gone',
  411: 'Length Required',
  412: 'Precondition Failed',
  413: 'Request Too Large',
  414: 'Request-URI Too Long',
  415: 'Unsupported Media Type',
  416: 'Range Not Satisfiable',
  417: 'Expectation Failed',
  500: 'Internal Server Error',
  501: 'Not Implemented',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Timeout',
  505: 'HTTP Version Not Supported',
  511: 'Network Authentication Required',
};

/**
 * Creates an application/problem+json response
 * @param {Object} problem the problem json
 * @param {number} problem.status the status code for the problem
 * @returns {Response} the problem response
 */
export function sendProblem(problem) {
  const { status } = problem;
  return new Response(JSON.stringify(problem), {
    headers: {
      'Content-Type': 'application/problem+json',
    },
    status,
  });
}

/**
 * Attempts to send a reasonable problem h
 * @param {*} err the error to handle
 * @param {string} instance an identifier for this error instance
 *  to enable tracking back in the logs
 * @returns Response
 */
export function handleErrorAsProblem(err, instance) {
  let { status } = err;
  if (!status) {
    status = 500;
  }
  return sendProblem({
    status,
    title: err.title || STATUS_MESSAGES[status],
    details: err.details || err.message,
    instance,
  });
}

/**
 * Function for handling a routes inside Frankin / Content Lake services
 * @callback Handler
 * @param {Request} req the request
 * @param {UniversalContext} context the context of the request
 * @param {Record<string,string>} params the parameters parsed from the request
 * @returns {Promise<Response>} the response from the request
 */

export class Router {
  methods = {};

  /**
   *
   * @param {string} method
   * @param {string} path
   * @param {Handler} handler
   */
  addRoute(method, path, handler) {
    if (!this.methods[method]) {
      this.methods[method] = routington();
    }
    this.methods[method].define(path)[0].handler = handler;
  }

  /**
   *
   * @param {string} path
   * @param {Handler} handler
   */
  delete(path, handler) {
    this.addRoute('DELETE', path, handler);
    return this;
  }

  /**
   *
   * @param {string} path
   * @param {Handler} handler
   */
  get(path, handler) {
    this.addRoute('GET', path, handler);
    return this;
  }

  /**
   *
   * @param {string} path
   * @param {Handler} handler
   */
  post(path, handler) {
    this.addRoute('POST', path, handler);
    return this;
  }

  /**
   *
   * @param {string} path
   * @param {Handler} handler
   */
  put(path, handler) {
    this.addRoute('PUT', path, handler);
    return this;
  }

  /**
   * Handles the specified request
   * @param {Request} request
   * @param {UniveralContext} context
   * @returns {Promise<Response>}
   */
  async handle(request, context) {
    const log = context.log || console;
    const { method } = request;
    const { suffix } = context.pathInfo;
    if (this.methods[request.method]) {
      log.debug('Handing request', { method, suffix });
      const match = this.methods[method].match(context.pathInfo.suffix);
      if (match) {
        try {
          return match.node.handler(request, context, match.params);
        } catch (err) {
          const instance = randomUUID();
          log.warn('Caught exception from handler', {
            method,
            suffix,
            err,
            instance,
          });
          return handleErrorAsProblem(err, instance);
        }
      }
    } else {
      log.debug('No routes found', { method, suffix });
    }
    return sendProblem({
      status: 405,
      title: 'Method Not Allowed',
    });
  }
}
