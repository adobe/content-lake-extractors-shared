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

/* eslint-disable class-methods-use-this */

/**
 * @implements {import('../src/extractors').Extractor}
 */
export class MockExtractor {
  /**
   * @type {Array<import('../../src/extractors').AssetBatch>}
   */
  batches;

  /**
   *
   * @param {Array<import('../../src/extractors').AssetBatch>} batches
   */
  constructor(batches) {
    this.batches = batches;
  }

  async getAssets(cursor) {
    let index = cursor || 0;
    if (cursor?.cursor) {
      index = cursor.cursor;
    }

    if ((typeof index) !== 'number') {
      index = 0;
    }

    return this.batches[index];
  }

  async getBinaryRequest() {
    return {
      requestType: 'http',
      url: 'https://www.adobe.com/content/dam/cc/icons/Adobe_Corporate_Horizontal_Red_HEX.svg',
    };
  }

  async getFolders() {
    return [];
  }
}
