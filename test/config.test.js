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
import { mockClient } from 'aws-sdk-client-mock';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import { ConfigurationManager } from '../src/config.js';

describe('Configuration Manager', () => {
  let s3Mock;
  before(() => {
    s3Mock = mockClient(S3Client);
    const stream = new Readable();
    stream.push(JSON.stringify({ message: 'Hello World' }));
    stream.push(null);
    s3Mock
      .on(GetObjectCommand, {
        Key: 'test',
        Bucket: 'content-lake-extractors-configuration',
      })
      .resolves({
        Body: stream,
      });
  });
  it('can get configuration', async () => {
    const cfgMgr = new ConfigurationManager();
    const config = await cfgMgr.getConfiguration('test');
    assert.ok(config);
    assert.strictEqual(config.message, 'Hello World');
  });

  it('can put configuration', async () => {
    const cfgMgr = new ConfigurationManager();
    await cfgMgr.putConfiguration('test', { message: 'Hello' });
  });
});
