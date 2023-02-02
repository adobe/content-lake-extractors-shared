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

  /**
   * Creates a Function runner
   * @param {Object | undefined} config the configuration
   */
  constructor(config) {
    this.#client = new LambdaClient({ region: 'us-east-1', ...config });
  }

  /**
   * Invokes a function
   * @param {string} name the name of the lambda function to invoke
   * @param {Record<string,any>} payload the payload for the invocation
   * @returns {Promise<AWS.Lambda.InvocationResponse>} the result of the invocation
   */
  async invokeFunction(name, payload) {
    await this.#client.send(
      new InvokeCommand({
        InvocationType: 'Event',
        FunctionName: name,
        Payload: JSON.stringify(payload),
      }),
    );
  }

  /**
   * Invokes a function and returns the response
   * @param {string} name the name of the lambda function to invoke
   * @param {Record<string,any>} payload the payload for the invocation
   * @returns {Promise<AWS.Lambda.InvocationResponse>} the result of the invocation
   */
  async invokeFunctionWithResponse(name, payload) {
    const result = await this.#client.send(
      new InvokeCommand({
        InvocationType: 'RequestResponse',
        FunctionName: name,
        Payload: JSON.stringify(payload),
      }),
    );
    let data = JSON.parse(Buffer.from(result.Payload || [0]).toString());
    if (typeof data === 'string') {
      data = JSON.parse(data);
    }
    return {
      status: result.StatusCode,
      data,
    };
  }
}
