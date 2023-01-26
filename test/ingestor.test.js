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
/* eslint-env mocha */

import assert from 'assert';
import nock from 'nock';

import { IngestorClient } from '../src/ingestor.js';
import { MockExtractor } from './mocks/mockextractor.js';

const TEST_INGESTOR_URL = 'http://localhost:8081';

describe('Ingestor Client Tests', function () {
  this.timeout(10000);
  const mockExtractor = new MockExtractor([
    {
      assets: [
        {
          id: 1,
          sourceId: 1,
          sourceType: 'mock',
        },
        {
          id: 2,
          sourceId: 1,
          sourceType: 'mock',
        },
      ],
      more: true,
      cursor: 1,
    },
    {
      assets: [
        {
          id: 3,
          sourceId: 1,
          sourceType: 'mock',
        },
      ],
      more: false,
    },
  ]);

  it('Can ingest assets', async () => {
    const scope = nock(TEST_INGESTOR_URL)
      .post('/')
      .matchHeader('x-api-key', 'test-api-key')
      .twice()
      .reply(200, 'Ok');
    const client = new IngestorClient({
      url: `${TEST_INGESTOR_URL}/`,
      apiKey: 'test-api-key',
      jobId: 'test-job-id',
    }).withLog(console);
    await client.submitBatch(mockExtractor);
    assert.ok(scope.isDone());
  });

  it('Can set cursor', async () => {
    const scope = nock(TEST_INGESTOR_URL)
      .post('/')
      .matchHeader('x-api-key', 'test-api-key')
      .reply(200, 'Ok');
    const client = new IngestorClient({
      url: `${TEST_INGESTOR_URL}/`,
      apiKey: 'test-api-key',
      jobId: 'test-job-id',
    }).withLog(console);
    await client.submitBatch(mockExtractor, 1);
    assert.ok(scope.isDone());
  });

  it('Can set limit', async () => {
    const scope = nock(TEST_INGESTOR_URL)
      .post('/')
      .matchHeader('x-api-key', 'test-api-key')
      .twice()
      .reply(200, 'Ok');
    const client = new IngestorClient({
      url: `${TEST_INGESTOR_URL}/`,
      apiKey: 'test-api-key',
      jobId: 'test-job-id',
    }).withLog(console);
    await client.submitBatch(mockExtractor, undefined, 2);
    assert.ok(scope.isDone());
  });

  it('Can can retry on failure', async () => {
    const scope = nock(TEST_INGESTOR_URL)
      .post('/')
      .matchHeader('x-api-key', 'test-api-key')
      .reply(502)
      .post('/')
      .matchHeader('x-api-key', 'test-api-key')
      .twice()
      .reply(200, 'Ok');
    const client = new IngestorClient({
      url: `${TEST_INGESTOR_URL}/`,
      apiKey: 'test-api-key',
      jobId: 'test-job-id',
    });
    await client.submitBatch(mockExtractor);
    assert.ok(scope.isDone());
  });
  it('Can can read retry after header', async () => {
    const scope = nock(TEST_INGESTOR_URL)
      .post('/')
      .matchHeader('x-api-key', 'test-api-key')
      .reply(502, '', { 'Retry-After': 1 })
      .post('/')
      .matchHeader('x-api-key', 'test-api-key')
      .twice()
      .reply(200, 'Ok');
    const client = new IngestorClient({
      url: `${TEST_INGESTOR_URL}/`,
      apiKey: 'test-api-key',
      jobId: 'test-job-id',
    });
    await client.submitBatch(mockExtractor);
    assert.ok(scope.isDone());
  });
});
