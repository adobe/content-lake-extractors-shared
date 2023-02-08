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
/* eslint-disable no-await-in-loop */
/* eslint-env mocha */
import * as dotenv from 'dotenv';
import { randomUUID } from 'crypto';
import assert from 'assert';
import { SettingsStore } from '../src/settings.js';
import { extractCredentials } from '../src/context.js';

dotenv.config();

describe('Settings Store Integration Tests', async function () {
  this.timeout(60000);
  const instances = [];
  before(function () {
    if (!process.env.AWS_ACCESS_KEY_ID) {
      this.skip();
    }
  });
  after(async () => {
    const store = new SettingsStore(extractCredentials(process.env));
    for (const instance of instances) {
      await store.deleteSettings(instance);
    }
  });
  it('fails on non-existant config', async () => {
    const store = new SettingsStore(extractCredentials(process.env));
    let caught;
    try {
      await store.getConfiguration('doesnotexist');
    } catch (err) {
      caught = err;
    }
    assert.ok(caught);
  });

  it('can create, get and delete settings', async () => {
    const instanceId = randomUUID();
    instances.push(instanceId);
    const store = new SettingsStore(extractCredentials(process.env));
    let value = await store.getSettings(instanceId);
    assert.ok(!value);

    await store.putSettings({
      instanceId,
      extractorType: 'test',
      tenantId: 'test',
    });

    value = await store.getSettings(instanceId);
    assert.ok(value);
    assert.strictEqual(value.instanceId, instanceId);
    assert.strictEqual(value.extractorType, 'test');

    value.extractorType = 'test2';

    await store.putSettings(value);

    value = await store.getSettings(instanceId);
    assert.strictEqual(value.extractorType, 'test2');

    await store.deleteSettings(instanceId);
    value = await store.getSettings(instanceId);
    assert.ok(!value);
  });

  describe('search', () => {
    const store = new SettingsStore(extractCredentials(process.env));
    before(async () => {
      const values = ['test1', 'test2', 'test3'];
      for (const tenantId of values) {
        for (const extractorType of values) {
          const instanceId = randomUUID();
          instances.push(instanceId);
          await store.putSettings({
            instanceId,
            extractorType,
            tenantId,
          });
        }
      }
    });

    it('requires search param', async () => {
      let caught;
      try {
        await store.findSettings({});
      } catch (err) {
        caught = err;
      }
      assert.ok(caught);
      assert.strictEqual(caught.status, 400);
    });

    it('can search by tenant', async () => {
      const res = await store.findSettings({ tenantId: 'test1' });
      assert.ok(res);
      assert.ok(res.count > 0);
    });

    it('can search by extractorType', async () => {
      const res = await store.findSettings({ extractorType: 'test1' });
      assert.ok(res);
      assert.ok(res.count > 0);
    });

    it('can limit results', async () => {
      const res = await store.findSettings({
        extractorType: 'test1',
        limit: 1,
      });
      assert.ok(res);
      assert.strictEqual(res.count, 1);
      assert.ok(res.cursor);
    });

    it('can page results', async () => {
      let pages = 0;
      let res = await store.findSettings({
        extractorType: 'test1',
        limit: 1,
      });
      let { cursor } = res;
      while (cursor) {
        pages += 1;
        res = await store.findSettings({
          extractorType: 'test1',
          limit: 1,
          cursor,
        });
        cursor = res.cursor;
      }
      assert.ok(pages > 1);
    });
  });
});
