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
import { forEachLimit, mapLimit } from 'async';
import fetchBuilder from 'fetch-retry';
import { randomUUID } from 'crypto';

// eslint-disable-next-line no-unused-vars
import * as extractors from './extractors.js';

const fetch = fetchBuilder(originalFetch);

/**
 * @typedef IngestorConfig the confiuration for the ingestor client
 * @property {string} url the URL for calling the ingestor
 * @property {string} apiKey the API Key used to call the ingestor
 * @property {string} jobId the id of the current job
 */

// Constants for retry configuration
const SEC_IN_MS = 1000;
const DEFAULT_RETRIES = 3;
const DEFAULT_TIMEOUT = SEC_IN_MS * 30;

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
   * @param {extractors.BinaryRequest} binary the reference to the binary to ingest
   */
  async submit(data, binary) {
    const signal = timeoutSignal(DEFAULT_TIMEOUT);
    const start = Date.now();
    const body = {
      jobId: this.#config.jobId,
      data,
      binary,
    };

    const requestInfo = (({ id: assetId, sourceId, sourceType } = data) => ({
      assetId,
      sourceId,
      sourceType,
      jobId: this.#config.jobId,
      requestId: randomUUID(),
    }))();
    this.#log.debug('Submitting for ingestion', {
      url: this.#config.url,
      ...requestInfo,
    });
    const res = await fetch(this.#config.url, {
      headers: {
        'X-API-Key': this.#config.apiKey,
        'Content-Type': 'application/json',
      },
      method: 'POST',
      signal,
      body: JSON.stringify(body),
      retries: DEFAULT_RETRIES,
      retryDelay: (attempt, err, response) => {
        let delay;
        if (response?.headers?.has('Retry-After')) {
          delay = response.headers.get('Retry-After') * SEC_IN_MS;
        } else {
          // calculate an exponential backoff, for some reason eslint prefers ** to Math.pow
          delay = attempt ** 2 * SEC_IN_MS;
        }
        this.#log.info('Retrying request', {
          err,
          attempt,
          delay,
          status: `${response?.status}: ${response?.statusText}`,
          url: response?.url,
          ...requestInfo,
        });
        return delay;
      },
      retryOn: [429, 500, 502, 503],
    });
    if (res.ok) {
      this.#log.info('Asset submitted successfully', {
        status: `${res.status}: ${res.statusText}`,
        duration: Date.now() - start,
        url: this.#config.url,
        ...requestInfo,
      });
    } else {
      let responseBody = await res.text();
      try {
        responseBody = JSON.parse(responseBody);
      } catch (err) {
        // no need, response was not json
      }
      this.#log.warn('Failed to submit asset', {
        responseStatus: `${res.status}: ${res.statusText}`,
        responseBody,
        responseheaders: Object.fromEntries(res.headers),
        duration: Date.now() - start,
        url: this.#config.url,
        ...requestInfo,
      });
    }
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
    this.#log.info('Retrieving binary requests', {
      count: batch.assets.length,
      limit,
      jobId: this.#config.jobId,
    });
    const resolved = await mapLimit(batch.assets, limit || 1, async (data) => {
      const binary = await extractor.getBinaryRequest(data.id);
      return { data, binary };
    });

    this.#log.info('Sending asets', {
      count: batch.assets.length,
      limit,
      jobId: this.#config.jobId,
    });
    await forEachLimit(resolved, 2, async (asset) => {
      await this.submit(asset.data, asset.binary);
    });
    return batch.cursor;
  }
}
