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
import { RestError } from '@adobe/content-lake-commons';

import { HttpService } from '../src/http-service.js';
import { MockExtractor } from './mocks/mockextractor.js';
import { MockFunctionRunner } from './mocks/mock-function-runner.js';
import { MockIngestorClient } from './mocks/mock-ingestor-client.js';
import { assertRejectsStatus } from './util.js';

const FUNCTION_NAME = 'mock-function';

const FUNCTION_URL = 'http://reallyfakehttpservicemockurlfortesting';

describe('HTTP Service Tests', () => {
  /**
   * @type {MockIngestorClient}
   */
  let ingestorClient;

  /**
   * @type {MockFunctionRunner}
   */
  let functionRunner;

  function createContext() {
    return {
      env: {
        INGESTOR_URL: FUNCTION_URL,
        INGESTOR_API_KEY: 'ingestor-key',
        AWS_ACCESS_KEY_ID: 'aws-key',
        AWS_ACCESS_SECRET_KEY: 'aws-secret',
      },
      func: {
        fqn: FUNCTION_NAME,
      },
    };
  }

  function createValidRequest(cursor) {
    const json = {
      spaceId: 'space',
      sourceId: 'source',
      jobId: 'job',
      action: 'extract',
    };
    if (cursor) {
      json.cursor = cursor;
    }
    return {
      url: '/',
      method: 'POST',
      json: async () => json,
    };
  }

  function createAsset(assetId) {
    return {
      sourceAssetId: assetId,
      sourceId: 'mock1',
      sourceType: 'mock',
      name: assetId,
    };
  }

  beforeEach(() => {
    ingestorClient = new MockIngestorClient();
    functionRunner = new MockFunctionRunner();
    nock.cleanAll();
  });

  afterEach(() => {
    assert.ok(nock.isDone());
  });

  it('test handle successful request', async () => {
    const httpService = new HttpService({
      extractor: new MockExtractor([]),
      ingestorClient,
      functionRunner,
    });

    const result = await httpService.handleRequest(
      createValidRequest(),
      createContext(),
    );

    assert.deepStrictEqual(result, {});
    assert.strictEqual(ingestorClient.batches.length, 1);
    assert.strictEqual(functionRunner.getInvocations(FUNCTION_NAME).length, 0);
  });

  it('test handle successful paged request', async () => {
    ingestorClient.nextCursor('test-cursor', true);
    const httpService = new HttpService({
      extractor: new MockExtractor([]),
      ingestorClient,
      functionRunner,
    });

    const result = await httpService.handleRequest(
      createValidRequest(),
      createContext(),
    );

    assert.deepStrictEqual(result, {
      action: 'extract',
      cursor: 'test-cursor',
      jobId: 'job',
      sourceId: 'source',
      spaceId: 'space',
    });
    assert.strictEqual(ingestorClient.batches.length, 1);
    assert.strictEqual(functionRunner.getInvocations(FUNCTION_NAME).length, 1);
  });

  it('test handle bad body', () => {
    const httpService = new HttpService({
      extractor: new MockExtractor([]),
      ingestorClient,
      functionRunner,
    });

    return assertRejectsStatus(() => httpService.handleRequest({
      json: async () => {
        throw new Error('bad error');
      },
    }, createContext()), 400);
  });

  it('test handle bad action', () => {
    const httpService = new HttpService({
      extractor: new MockExtractor([]),
      ingestorClient,
      functionRunner,
    });

    return assertRejectsStatus(() => httpService.handleRequest({
      json: async () => ({}),
    }, createContext()), 400);
  });

  it('test handle no ingestor api key', () => {
    const httpService = new HttpService({
      extractor: new MockExtractor([]),
      ingestorClient,
      functionRunner,
    });

    const context = createContext();
    delete context.env.INGESTOR_API_KEY;
    return assertRejectsStatus(() => httpService.handleRequest(
      createValidRequest(),
      context,
    ), 400);
  });

  it('test handle no ingestor url', () => {
    const httpService = new HttpService({
      extractor: new MockExtractor([]),
      ingestorClient,
      functionRunner,
    });

    const context = createContext();
    delete context.env.INGESTOR_URL;
    return assertRejectsStatus(() => httpService.handleRequest(
      createValidRequest(),
      context,
    ), 400);
  });

  it('test handle no extractor', () => {
    const httpService = new HttpService({
      ingestorClient,
      functionRunner,
    });

    const context = createContext();
    return assertRejectsStatus(() => httpService.handleRequest(
      createValidRequest(),
      context,
    ), 500);
  });

  it('test handle error', async () => {
    const response = HttpService.handleError(
      {
        method: 'GET',
        url: 'testing',
      },
      createContext(),
      new RestError(400, 'this is a test'),
    );
    assert.strictEqual(response.status, 400);
    assert.strictEqual(response.statusText, 'Bad Request');
    assert.strictEqual(response.headers['Content-Type'], 'application/problem+json');

    const detail = JSON.parse(response.body);
    assert.strictEqual(detail.status, 400);
    assert.strictEqual(detail.title, 'Bad Request');
    assert.strictEqual(detail.detail, 'this is a test');
  });

  it('test generic handle error', async () => {
    const response = HttpService.handleError(
      {
        method: 'GET',
        url: 'testing',
      },
      createContext(),
      'this is a test',
    );
    assert.strictEqual(response.status, 500);
    assert.strictEqual(response.statusText, 'Internal Server Error');
    assert.strictEqual(response.headers['Content-Type'], 'application/problem+json');
  });

  function createExpectedRequest(assetId) {
    return {
      binary: {
        requestType: 'http',
        url: 'https://www.adobe.com/content/dam/cc/icons/Adobe_Corporate_Horizontal_Red_HEX.svg',
      },
      data: {
        sourceAssetId: assetId,
        name: assetId,
        sourceId: 'mock1',
        sourceType: 'mock',
      },
    };
  }

  it('test extract generate response', async () => {
    const posts = [];
    nock(FUNCTION_URL)
      .post('/', (body) => {
        posts.push(body);
        return true;
      })
      .times(5)
      .reply(200);
    const httpService = new HttpService({
      extractor: new MockExtractor([{
        assets: [
          createAsset('asset1'),
          createAsset('asset2'),
          createAsset('asset3'),
        ],
        more: true,
        cursor: 1,
      }, {
        assets: [
          createAsset('asset4'),
          createAsset('asset5'),
        ],
        more: false,
      }]),
      ingestorClient: false,
      functionRunner,
    });
    const request = createValidRequest();
    const requestJson = await request.json();
    const result = await httpService.generateResponse(
      request,
      createContext(),
    );
    const nextJson = {
      ...requestJson,
      cursor: 1,
    };
    assert.deepStrictEqual(result, nextJson);
    assert.deepStrictEqual(functionRunner.getInvocations(FUNCTION_NAME), [nextJson]);

    // simluate sending a request for the second page
    const result2 = await httpService.generateResponse(
      createValidRequest(1),
      createContext(),
    );
    assert.deepStrictEqual(result2, {});
    assert.deepStrictEqual(posts, [
      createExpectedRequest('asset1'),
      createExpectedRequest('asset2'),
      createExpectedRequest('asset3'),
      createExpectedRequest('asset4'),
      createExpectedRequest('asset5'),
    ]);
  });

  it('test health check generate response', async () => {
    const httpService = new HttpService({
      extractor: new MockExtractor([]),
      ingestorClient,
      functionRunner,
    });
    const result = await httpService.generateResponse({
      method: 'GET',
      url: '/healthcheck',
    }, createContext());
    assert.strictEqual(result.status, 200);
  });

  it('test health check bad method generate response', async () => {
    const httpService = new HttpService({
      extractor: new MockExtractor([]),
      ingestorClient,
      functionRunner,
    });
    const result = await httpService.generateResponse({
      method: 'DELETE',
      url: '/healthcheck',
    }, createContext());
    assert.strictEqual(result.status, 400);
  });
});
