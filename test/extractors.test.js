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
import { extractAssets } from '../src/extractors.js';
import { MockExtractor } from './mocks/mockextractor.js';

describe('Extractors Test', () => {
  it('can extract all', async () => {
    let count = 0;
    const mockExtractor = new MockExtractor([
      {
        assets: [
          {
            assetId: 1,
          },
          {
            assetId: 2,
          },
        ],
        more: true,
        cursor: 1,
      },
      {
        assets: [
          {
            assetId: 3,
          },
        ],
        more: false,
      },
    ]);
    await extractAssets(mockExtractor, () => {
      count += 1;
    });
    assert(count === 3);
  });
});
