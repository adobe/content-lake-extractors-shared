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
import * as dotenv from 'dotenv';
import assert from 'assert';
import { ConfigurationManager } from '../src/config.js';

dotenv.config();

describe('Configuration Manager Integration Tests', async () => {
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
  it('can get non-existent config', async () => {
    const cfgMgr = new ConfigurationManager(extractor, mgrCfg);
    const config = await cfgMgr.getConfiguration('doesnotexist');
    assert.ok(!config);
  });

  it('rethrows unexpected exception', async () => {
    const newConfig = JSON.parse(JSON.stringify(mgrCfg));
    newConfig.credentials.accessKeyId = 'invalid';
    const cfgMgr = new ConfigurationManager(extractor, newConfig);
    let caught;
    try {
      await cfgMgr.getConfiguration('test');
    } catch (err) {
      caught = err;
    }
    assert.ok(caught);
  });

  it('can get', async () => {
    const cfgMgr = new ConfigurationManager(extractor, mgrCfg);
    await cfgMgr.putConfiguration('test', { message: 'Hello' });
    const config = await cfgMgr.getConfiguration('test');
    assert.ok(config);
    assert.strictEqual('Hello', config.message);
  });

  it('can list', async () => {
    const cfgMgr = new ConfigurationManager(extractor, mgrCfg);
    const configs = await cfgMgr.listConfigurations();
    assert.ok(configs.length > 0);
  });

  it('can put', async () => {
    const cfgMgr = new ConfigurationManager(extractor, mgrCfg);
    await cfgMgr.putConfiguration('test', { message: 'Hello' });
    await cfgMgr.putConfiguration('test', { message: 'Hello2' });
  });
});
