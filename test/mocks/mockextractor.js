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

export class MockExtractor {
  binaryRequestFunction = () => Promise.resolve({
    requestType: 'http',
    url: 'https://www.adobe.com/content/dam/cc/icons/Adobe_Corporate_Horizontal_Red_HEX.svg',
  });

  batches = [];

  data = {};

  constructor(batches) {
    this.batches = batches;
    batches.forEach((batch) => batch.data.forEach((data) => {
      this.data[data.sourceAssetId] = data;
    }));
  }

  async getSourceData(sourceAssetId) {
    return Promise.resolve(this.data[sourceAssetId]);
  }

  async getSourceDataBatch(config) {
    return Promise.resolve(this.batches[config.cursor || 0]);
  }

  async getBinaryRequest() {
    return this.binaryRequestFunction();
  }
}
