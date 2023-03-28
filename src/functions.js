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

import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';

/**
 * @typedef InvocationResponse
 * @property {number} status
 * @property {Object | undefined} data
 */

export class FunctionRunner {
  #client;

  #log = console;

  /**
   * Creates a Function runner
   * @param {Object | undefined} config the configuration
   */
  constructor(config) {
    this.#client = new LambdaClient({ region: 'us-east-1', ...config });
  }

  withLogger(logger) {
    this.#log = logger;
    return this;
  }

  /**
   * Invokes a function
   * @param {string} name the name of the lambda function to invoke
   * @param {Record<string,any>} payload the payload for the invocation
   * @returns {Promise<void>} when the invocation completes
   */
  async invokeFunction(name, payload) {
    this.#log.debug('Invoking function with response', { name, payload });
    const result = await this.#client.send(
      new InvokeCommand({
        InvocationType: 'Event',
        FunctionName: name,
        Payload: JSON.stringify(payload),
      }),
    );
    this.verifyResult(result, name);
  }

  /**
   * Invokes a function and returns the response
   * @param {string} name the name of the lambda function to invoke
   * @param {Record<string,any>} payload the payload for the invocation
   * @returns {Promise<any>} the result of the invocation
   */
  async invokeFunctionWithResponse(name, payload) {
    this.#log.debug('Invoking function with response', { name, payload });
    const result = await this.#client.send(
      new InvokeCommand({
        InvocationType: 'RequestResponse',
        FunctionName: name,
        Payload: JSON.stringify(payload),
      }),
    );
    this.verifyResult(result, name);
    const data = this.parseResponsePayload(result.Payload, name);
    this.#log.debug('Successfully retrieved response', data);

    if (data.status >= 400) {
      const resultData = FunctionRunner.resultData(result, data);
      const err = new Error('Invalid response body from function');
      err.status = 502;
      err.detail = `Invalid response body from function: ${JSON.stringify(
        resultData,
      )}`;
      throw err;
    }
    return data;
  }

  /**
   * @param {InvokeCommandOutput} result
   * @param {any} data
   */
  static resultData(result, data) {
    return {
      status: result.StatusCode,
      logs: result.LogResult,
      error: result.FunctionError,
      data,
    };
  }

  /**
   * Verifies the result and will throw an exeception if an error was
   * returned from the function invocation
   * @param {InvokeCommandOutput} result
   * @param {string} functionName
   */
  verifyResult(result, functionName) {
    if (![200, 202, 204].includes(result.StatusCode)) {
      const resultData = FunctionRunner.resultData(
        result,
        this.parseResponsePayload(result, functionName),
      );
      this.#log.warn('Invalid result from function invocation', resultData);
      const err = new Error('Invalid result from function invocation');
      err.status = 502;
      err.detail = `Invalid result from function invocation: ${JSON.stringify(
        resultData,
      )}`;
      throw err;
    }
  }

  /**
   * @param {Uint8Array} payload
   * @param {string} functionName
   */
  parseResponsePayload(payload, functionName) {
    let data;
    try {
      data = Buffer.from(payload).toString();
      if (typeof data === 'string') {
        data = JSON.parse(data);
      }
      if (typeof data === 'string') {
        data = JSON.parse(data);
      }
    } catch (err) {
      this.#log.warn('Unable to parse response from function', {
        functionName,
        data,
      });
    }
    return data;
  }
}
