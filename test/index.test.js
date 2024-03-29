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
import {
  auth,
  BaseBatchProvider,
  batch,
  ingestor,
  functions,
  RequestHandler,
  settings,
  mocks,
} from '../src/index.js';

describe('Index Tests', () => {
  it('export auth is present', async () => {
    assert.ok(auth);
  });

  it('export BaseBatchProvider is present', async () => {
    assert.ok(BaseBatchProvider);
  });

  it('export batch is present', async () => {
    assert.ok(batch);
  });

  it('export functions is present', async () => {
    assert.ok(functions);
  });

  it('export ingestor is present', async () => {
    assert.ok(ingestor);
  });

  it('export mocks is present', async () => {
    assert.ok(mocks);
  });

  it('export RequestHandler is present', async () => {
    assert.ok(RequestHandler);
  });

  it('export settings is present', async () => {
    assert.ok(settings);
  });
});
