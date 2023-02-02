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
import { contextHelper } from '../src/index.js';

describe('Context Tests', () => {
  describe('getLog', () => {
    it('falls back to console', () => {
      assert.ok(contextHelper.getLog({}));
    });

    it('falls back to console', () => {
      assert.strictEqual(contextHelper.getLog({ log: 'test' }), 'test');
    });
  });

  describe('get original event', () => {
    it('will not fail if not present', () => {
      assert.ok(!contextHelper.extractOriginalEvent({}));
    });

    it('will extract original event', () => {
      const res = contextHelper.extractOriginalEvent({
        invocation: { event: 'test' },
      });
      assert.strictEqual(res, 'test');
    });
  });
  describe('extractCredentials', () => {
    it('wont fail if not present', () => {
      assert.ok(contextHelper.extractCredentials({}));
    });

    it('can load without session token', () => {
      const creds = contextHelper.extractCredentials({
        AWS_ACCESS_KEY_ID: 'key',
        AWS_ACCESS_SECRET_KEY: 'secret',
      });
      assert.ok(creds.credentials);
      assert.strictEqual('key', creds.credentials.accessKeyId);
      assert.strictEqual('secret', creds.credentials.secretAccessKey);
    });

    it('can load with session token', () => {
      const creds = contextHelper.extractCredentials({
        AWS_ACCESS_KEY_ID: 'key',
        AWS_ACCESS_SECRET_KEY: 'secret',
        AWS_SESSION_TOKEN: 'session',
      });
      assert.ok(creds.credentials);
      assert.strictEqual('key', creds.credentials.accessKeyId);
      assert.strictEqual('secret', creds.credentials.secretAccessKey);
      assert.strictEqual('session', creds.credentials.sessionToken);
    });
  });
});
