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

/**
 * Provides functionality for a function runner from the extractor shared library.
 */
export class MockFunctionRunner {
  #invocations;

  /**
   * Constructs a new function runner with no invocations.
   */
  constructor() {
    this.#invocations = {};
  }

  /**
   * Records that an invocation for the given function was executing, storing the
   * payload.
   * @param {string} functionName Name of the function being invoked.
   * @param {*} functionPayload Payload with which the function was invoked.
   */
  invokeFunction(functionName, functionPayload) {
    if (!this.#invocations[functionName]) {
      this.#invocations[functionName] = [];
    }
    this.#invocations[functionName].push(functionPayload);
  }

  /**
   * Retrieves the payloads that were used to invoke the given function name.
   * @param {string} functionName Name of the function whose invocations should
   *  be retrieved.
   * @returns {Array} List of payloads with which the function was invoked.
   */
  getInvocations(functionName) {
    return this.#invocations[functionName] || [];
  }
}
