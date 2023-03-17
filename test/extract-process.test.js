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

import { MockIngestorClient } from './mocks/mock-ingestor-client.js';
import { MockFunctionRunner } from './mocks/mock-function-runner.js';
import { ExtractProcess } from '../src/extract-process.js';
import { MockExtractor } from './mocks/mockextractor.js';
import { assertRejectsStatus } from './util.js';

const EXTRACTOR_ID = 'mock-extractor';

describe('Extract Process Tests', () => {
  /**
   * @type {MockIngestorClient}
   */
  let mockIngestor;

  /**
   * @type {MockFunctionRunner}
   */
  let mockRunner;

  beforeEach(() => {
    mockIngestor = new MockIngestorClient();
    mockRunner = new MockFunctionRunner();
  });

  function createExtractInfo() {
    return {
      sourceId: 'source',
      spaceId: 'space',
      jobId: 'job',
      ingestorApiKey: 'ingestorKey',
      ingestorUrl: 'url',
      extractorId: EXTRACTOR_ID,
      credentials: {
        accessKeyId: 'awsKey',
        secretAccessKey: 'awsSecret',
      },
    };
  }

  it('test extract single page', async () => {
    const extractor = new MockExtractor([{
      assets: [],
      cursor: '',
    }]);
    const process = new ExtractProcess({
      extractor,
    }, mockIngestor, mockRunner);

    const info = createExtractInfo();
    const result = await process.extract(info);
    assert.ok(!result);
    assert.strictEqual(mockRunner.getInvocations(EXTRACTOR_ID).length, 0);
    assert.strictEqual(mockIngestor.batches.length, 1);

    const batch = mockIngestor.batches[0];
    assert.deepStrictEqual(batch.cursor, info);
    assert.strictEqual(batch.extractor, extractor);
  });

  it('test extract multiple pages', async () => {
    mockIngestor.nextCursor('next-page', true);
    const extractor = new MockExtractor([{
      assets: [],
      cursor: 'next-page',
    }]);
    const process = new ExtractProcess({
      extractor,
    }, mockIngestor, mockRunner);

    const info = createExtractInfo();
    const result = await process.extract(info);
    assert.deepStrictEqual(result, {
      cursor: 'next-page',
      jobId: 'job',
      sourceId: 'source',
      spaceId: 'space',
    });
    assert.deepStrictEqual(mockRunner.getInvocations(EXTRACTOR_ID), [{
      sourceId: 'source',
      spaceId: 'space',
      jobId: 'job',
      cursor: 'next-page',
    }]);
    assert.strictEqual(mockIngestor.batches.length, 1);

    const batch = mockIngestor.batches[0];
    assert.deepStrictEqual(batch.cursor, info);
    assert.strictEqual(batch.extractor, extractor);
  });

  it('test extract with cursor but not more', async () => {
    mockIngestor.nextCursor('next-page', false);
    const extractor = new MockExtractor([{
      assets: [],
      cursor: 'next-page',
    }]);
    const process = new ExtractProcess({
      extractor,
    }, mockIngestor, mockRunner);

    const info = createExtractInfo();
    const result = await process.extract(info);
    assert.ok(!result);
    assert.strictEqual(mockRunner.getInvocations(EXTRACTOR_ID).length, 0);
    assert.strictEqual(mockIngestor.batches.length, 1);

    const batch = mockIngestor.batches[0];
    assert.deepStrictEqual(batch.cursor, info);
    assert.strictEqual(batch.extractor, extractor);
  });

  it('test extractor missing error', () => {
    const process = new ExtractProcess();
    return assertRejectsStatus(
      () => process.extract(createExtractInfo()),
      500,
    );
  });

  it('test get ingestor client default', () => {
    const process = new ExtractProcess();
    assert.ok(process.getIngestorClient(createExtractInfo()));
  });

  it('test get function runner default', () => {
    const process = new ExtractProcess();
    assert.ok(process.getFunctionRunner(createExtractInfo()));
  });
});
