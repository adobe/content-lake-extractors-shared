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
import { randomUUID } from 'crypto';
import * as dotenv from 'dotenv';
import { SecretsManager } from '../src/secret.js';

dotenv.config();

describe('Secrets Manager Integration Tests', async function () {
  this.timeout(1000000);
  const extractor = 'it';
  let mgrCfg;
  before(function () {
    if (!process.env.AWS_ACCESS_KEY_ID) {
      this.skip();
    }
    mgrCfg = {
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_ACCESS_SECRET_KEY,
      },
    };
  });
  it('fails on non-existing secret', async () => {
    const mgr = new SecretsManager(extractor, mgrCfg);
    let caught;
    try {
      await mgr.getSecret('not-a-secret');
    } catch (err) {
      caught = err;
    }
    assert.ok(caught);
  });

  it('can create and get secret', async () => {
    const secretId = randomUUID();
    const mgr = new SecretsManager(extractor, mgrCfg);
    let caught;
    try {
      await mgr.getSecret(secretId);
    } catch (err) {
      caught = err;
    }
    assert.ok(caught);

    await mgr.putSecret(secretId, 'value1');

    let value = await mgr.getSecret(secretId);
    assert.strictEqual(value, 'value1');

    await mgr.putSecret(secretId, 'value2');

    value = await mgr.getSecret(secretId);
    assert.strictEqual(value, 'value2');
  });
});
