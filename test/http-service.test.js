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

import { HttpService } from '../src/http-service.js';
import { MockBatchProvider } from './mocks/mock-batch-provider.js';
import { MockBatchNode } from './mocks/mock-batch-node.js';
import { assertRejectsStatus } from './util.js';

describe('HTTP Service Tests', () => {
  /**
   * @type {MockBatchProvider}
   */
  let provider;

  function createValidRequest(batchItem = '/', state = false) {
    const json = {
      spaceId: 'space',
      sourceId: 'source',
      jobId: 'job',
      action: 'extract',
      batchItem,
    };
    if (state) {
      json.state = state;
    }
    return {
      url: '/',
      method: 'POST',
      json: async () => json,
    };
  }

  beforeEach(() => {
    provider = new MockBatchProvider();
    const subFolder = new MockBatchNode('/sub', [
      new MockBatchNode('/sub/asset4.jpg', [], true),
      new MockBatchNode('/sub/asset5.jpg', [], true),
    ]);
    const parent = new MockBatchNode('/', [
      subFolder,
      new MockBatchNode('/asset1.jpg', [], true),
      new MockBatchNode('/asset2.jpg', [], true),
      new MockBatchNode('/asset3.jpg', [], true),
    ]);
    provider
      .addNode(parent);
    nock.cleanAll();
  });

  afterEach(() => {
    assert.ok(nock.isDone());
  });

  it('test handle successful request', async () => {
    const httpService = new HttpService({
      batchProvider: provider,
    });

    const result = await httpService.handleRequest(
      createValidRequest(),
    );
    assert.deepStrictEqual(result, {
      errors: [],
      processed: 5,
      processingBatch: [
        '/asset1.jpg',
        '/asset2.jpg',
        '/asset3.jpg',
        '/sub/asset4.jpg',
        '/sub/asset5.jpg',
      ],
      processingQueue: [],
      traversed: 7,
      traversalBatch: [
        '/sub/asset4.jpg',
        '/sub/asset5.jpg',
      ],
      traversalQueue: [],
    });
    assert.deepStrictEqual(provider.processedItems, [
      '/asset1.jpg',
      '/asset2.jpg',
      '/asset3.jpg',
      '/sub/asset4.jpg',
      '/sub/asset5.jpg',
    ]);
  });

  it('test handle successful paged request', async () => {
    const httpService = new HttpService({
      batchProvider: provider,
    });

    const result = await httpService.handleRequest(
      createValidRequest('/sub', {
        traversalQueue: ['/asset1.jpg'],
      }),
    );

    assert.deepStrictEqual(result, {
      errors: [],
      processed: 3,
      processingBatch: [
        '/asset1.jpg',
        '/sub/asset4.jpg',
        '/sub/asset5.jpg',
      ],
      processingQueue: [],
      traversalBatch: [
        '/sub/asset4.jpg',
        '/sub/asset5.jpg',
      ],
      traversalQueue: [],
      traversed: 4,
    });
    assert.deepStrictEqual(provider.processedItems, [
      '/asset1.jpg',
      '/sub/asset4.jpg',
      '/sub/asset5.jpg',
    ]);
  });

  it('test handle bad body', () => {
    const httpService = new HttpService({
      batchProvider: provider,
    });

    return assertRejectsStatus(() => httpService.handleRequest({
      json: async () => {
        throw new Error('bad error');
      },
    }), 400);
  });

  it('test handle bad action', () => {
    const httpService = new HttpService({
      batchProvider: provider,
    });

    return assertRejectsStatus(() => httpService.handleRequest({
      json: async () => ({}),
    }), 400);
  });

  it('test handle no provder', () => {
    const httpService = new HttpService({});

    return assertRejectsStatus(() => httpService.handleRequest(
      createValidRequest(),
    ), 500);
  });

  it('test handle no batch item', () => {
    const httpService = new HttpService({
      batchProvider: provider,
    });

    return assertRejectsStatus(() => httpService.handleRequest(
      createValidRequest(''),
    ), 400);
  });

  it('test handle error', async () => {
    const httpService = new HttpService({
      batchProvider: provider,
    });
    const response = await httpService.generateResponse(createValidRequest(''));
    assert.strictEqual(response.status, 400);
    assert.strictEqual(response.headers.get('Content-Type'), 'application/problem+json');

    const detail = await response.json();
    assert.strictEqual(detail.status, 400);
    assert.strictEqual(detail.title, 'Bad Request');
    assert.strictEqual(detail.detail, 'batchItem is required in request JSON');
  });

  it('test extract generate response', async () => {
    const httpService = new HttpService({
      batchProvider: provider,
    });
    const request = createValidRequest();
    const response = await httpService.generateResponse(request);
    assert.strictEqual(response.status, 200);

    const result = await response.json();
    assert.deepStrictEqual(result, {
      errors: [],
      processed: 5,
      processingBatch: [
        '/asset1.jpg',
        '/asset2.jpg',
        '/asset3.jpg',
        '/sub/asset4.jpg',
        '/sub/asset5.jpg',
      ],
      processingQueue: [],
      traversalBatch: [
        '/sub/asset4.jpg',
        '/sub/asset5.jpg',
      ],
      traversalQueue: [],
      traversed: 7,
    });
  });

  it('test health check generate response', async () => {
    const httpService = new HttpService({
      batchProvider: provider,
    });
    const result = await httpService.generateResponse({
      method: 'GET',
      url: '/healthcheck',
    });
    assert.strictEqual(result.status, 200);
  });

  it('test health check bad method generate response', async () => {
    const httpService = new HttpService({
      batchProvider: provider,
    });
    const result = await httpService.generateResponse({
      method: 'DELETE',
      url: '/healthcheck',
    });
    assert.strictEqual(result.status, 400);
  });
});
