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
import { extractCredentials } from '../src/context.js';
import { FunctionRunner } from '../src/functions.js';

dotenv.config();

describe('Functions Integration Tests', async function () {
  this.timeout(60000);
  before(function () {
    if (!process.env.AWS_ACCESS_KEY_ID) {
      this.skip();
    }
  });
  it('can invoke function', async () => {
    const runner = new FunctionRunner(extractCredentials(process.env));
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
  });

  it('can invoke function via event', async () => {
    const runner = new FunctionRunner(extractCredentials(process.env));
    await runner.invokeFunction('helix-services--content-lake-echo-test', {
      message: 'ping',
      nested: {
        value: true,
      },
      another: 'key',
    });
  });

  it('event fails if not function', async () => {
    const runner = new FunctionRunner(extractCredentials(process.env));
    let caught;
    try {
      await runner.invokeFunction('helix-services--i-dont-exist', {
        Descartes: false,
      });
    } catch (err) {
      caught = err;
    }
    assert.ok(caught);
  });
});
