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

import assert from 'assert';

export async function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * Uses assert.throws() and verifies that the error thrown is a StockError with
 * a given status code.
 * @param {function} toAssert Function to execute, which will be passed to assert.throws().
 * @param {number} status Status code that should be on the error.
 */
export function assertThrowsStatus(toAssert, status) {
  assert.throws(toAssert, (e) => {
    assert.strictEqual(e.status, status);
    return true;
  });
}

/**
 * Uses assert.rejects() and verifies that the error thrown is a StockError with a given
 * status code.
 * @param {function} toAssert Function to execute, which will be passed to assert.rejects().
 * @param {number} status Status code that should be on the error.
 * @returns {Promise} Resolves when execution is complete.
 */
export function assertRejectsStatus(toAssert, status) {
  return assert.rejects(toAssert, (e) => {
    assert.strictEqual(e.status, status);
    return true;
  });
}
