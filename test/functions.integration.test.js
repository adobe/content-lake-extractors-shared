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
import * as dotenv from 'dotenv';
import { contextHelper } from '@adobe/content-lake-commons';
import { FunctionRunner } from '../src/functions.js';

dotenv.config();
const TEST_TIMEOUT = 60000;

describe('Functions Integration Tests', async () => {
  it('can invoke function with result', async () => {
    const runner = new FunctionRunner(contextHelper.extractAwsConfig(process));
    const res = await runner.invokeFunctionWithResponse(
      'helix-services--content-lake-echo-test',
      {
        message: 'ping',
        nested: {
          value: true,
        },
        another: 'key',
      },
    );
    assert.ok(res);
  }).timeout(TEST_TIMEOUT);

  it('can handle error response', async () => {
    const runner = new FunctionRunner(contextHelper.extractAwsConfig(process));
    let caught;
    try {
      await runner.invokeFunctionWithResponse(
        'helix-services--content-lake-echo-test',
        {
          status: 400,
        },
      );
    } catch (err) {
      caught = err;
    }
    assert.ok(caught);
    assert.equal(caught.status, 502);
    assert.ok(caught.detail);
  }).timeout(TEST_TIMEOUT);

  it('can invoke function via event', async () => {
    const runner = new FunctionRunner(contextHelper.extractAwsConfig(process));
    await runner.invokeFunction('helix-services--content-lake-echo-test', {
      message: 'ping',
      nested: {
        value: true,
      },
      another: 'key',
    });
  }).timeout(TEST_TIMEOUT);

  it('event fails if not function', async () => {
    const runner = new FunctionRunner(contextHelper.extractAwsConfig(process));
    let caught;
    try {
      await runner.invokeFunction('helix-services--i-dont-exist', {
        Descartes: false,
      });
    } catch (err) {
      caught = err;
    }
    assert.ok(caught);
  }).timeout(TEST_TIMEOUT);
});
