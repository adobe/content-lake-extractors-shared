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

import { timeoutSignal, fetch as originalFetch } from '@adobe/fetch';
import { forEachLimit } from 'async';
import fetchBuilder from 'fetch-retry';

// eslint-disable-next-line no-unused-vars
import * as extractors from './extractors.js';

const fetch = fetchBuilder(originalFetch);

/**
 * @typedef IngestorConfig the confiuration for the ingestor client
 * @property {string} url the URL for calling the ingestor
 * @property {string} apiKey the API Key used to call the ingestor
 * @property {string} jobId the id of the current job
 */

/**
 * The ingestor client sends asset data to the Content Lake ingestion service to be ingested
 */
export class IngestorClient {
  #config;

  #log;

  /**
   * Construct a new ingestor
   * @param {IngestorConfig} config the configuration for the ingestor
   */
  constructor(config) {
    this.#config = config;
    this.#log = console;
  }

  withLog(logger) {
    this.log = logger;
    return this;
  }

  /**
   * Submits the data and binary reference for ingestion
   * @param {extractors.AssetData} data the asset data to ingest
   * @param {extractors.BinaryRequest} binaryRequest the reference to the binary to ingest
   */
  async submit(data, binaryRequest) {
    const signal = timeoutSignal(5000);
    const start = Date.now();
    const body = {
      jobId: this.#config.jobId,
      data,
      binaryRequest,
    };
    this.#log.debug('Submitting for ingestion', body);
    const res = await fetch(this.#config.url, {
      headers: {
        'X-API-Key': this.#config.apiKey,
      },
      method: 'POST',
      signal,
      body: JSON.stringify(body),
      retryDelay: (attempt, _err, response) => {
        let delay;
        if (response.headers.has('Retry-After')) {
          delay = response.headers.get('Retry-After') * 1000;
        } else {
          delay = attempt ** 2 * 1000;
        }
        this.#log.info('Retrying request', {
          attempt,
          delay,
          status: `${response.status}: ${response.statusText}`,
          url: response.url,
        });
        return delay;
      },
      retryOn: [429, 502, 503],
    });
    this.#log.info('Asset submitted successfully', {
      status: `${res.status}: ${res.statusText}`,
      ...body,
      duration: Date.now() - start,
      url: this.#config.url,
    });
  }

  /**
   * Extract all of the assets from the source and call the callback
   * @param {extractors.Extractor} extractor the extractor from which to get the batch
   * @param {any | undefined} cursor the current cursor
   * @param {number | undefined} limit the limit for the number of concurrent requests
   * @returns {any} the next cursor or undefined if no more assets are available
   */
  async submitBatch(extractor, cursor, limit) {
    const batch = await extractor.getAssets(cursor);
    this.#log.info('Submitting asset batch', {
      count: batch.assets.length,
      limit,
    });
    await forEachLimit(batch.assets, limit || 1, async (data) => {
      const binaryRequest = await extractor.getBinaryRequest(data.assetId);
      await this.submit(data, binaryRequest);
    });
    return batch.cursor;
  }
}
