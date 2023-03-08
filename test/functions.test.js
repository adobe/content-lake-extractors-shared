/*
 * Copyright 2021 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

/* eslint-env mocha */
import assert from 'assert';
import { FunctionRunner } from '../src/functions.js';

describe('Functions Unit Tests', () => {
  describe('verifyResult', () => {
    const runner = new FunctionRunner();
    it('fails on 4xx+ status', () => {
      let caught;
      try {
        runner.verifyResult({
          StatusCode: 400,
          LogResult: 'Hello World',
          FunctionError: 'failed',
          Payload: JSON.stringify({ bad: true }),
        });
      } catch (err) {
        caught = err;
      }
      assert.ok(caught);
    });

    it('supports failure with no payload', () => {
      let caught;
      try {
        runner.verifyResult({
          StatusCode: 400,
          LogResult: 'Hello World',
          FunctionError: 'failed',
        });
      } catch (err) {
        caught = err;
      }
      assert.ok(caught);
    });
  });

  it('can set logger', () => {
    const messages = [];
    const runner2 = new FunctionRunner();
    runner2.withLogger({ warn: (...msg) => messages.push(msg) });
    try {
      runner2.verifyResult({
        StatusCode: 400,
        LogResult: 'Hello World',
        FunctionError: 'failed',
        Payload: JSON.stringify({ bad: true }),
      });
    } catch (err) {
      // don't really care
    }
    assert.strictEqual(2, messages.length);
  });
});
