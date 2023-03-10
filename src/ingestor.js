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

import { fetch as originalFetch } from '@adobe/fetch';
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
 * @property {string} companyId the id of the company for which this asset should be ingested
 * @property {string} jobId the id of the current job
 * @property {string} spaceId the id of the space into which this asset should be ingested
 */

/**
 * @typedef SubmitBatchOptions
 * @property {number | undefined} binaryRequestLimit the limit to the number of parallel requests
 *  to get the binary
 * @property {number | undefined} ingestLimit the limit to the number of parallel requests
 *  to ingest assets
 */

// Constants for retry configuration
const SEC_IN_MS = 1000;
const DEFAULT_INGEST_LIMIT = 2;
const DEFAULT_RETRIES = 3;

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
   * @param {string | undefined} batchId the current batchId
   */
  async submit(data, binary, batchId) {
    const start = Date.now();

    const { spaceId, companyId, jobId } = this.#config;
    const body = {
      jobId,
      companyId,
      spaceId,
      data,
      binary,
    };

    const requestInfo = (({
      id: assetId,
      sourceId,
      sourceType,
      name: assetName,
    } = data) => ({
      assetName,
      assetId,
      sourceId,
      sourceType,
      jobId,
      companyId,
      spaceId,
      requestId: randomUUID(),
      batchId,
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
   * @param {SubmitBatchOptions | undefined} options the limit for the number of concurrent requests
   * @returns {any} the next cursor or undefined if no more assets are available
   */
  async submitBatch(extractor, cursor, options) {
    const batchId = randomUUID();
    const batchStart = Date.now();
    const batch = await extractor.getAssets(cursor);
    const batchInfo = {
      skipped: batch.skipped,
      more: batch.more,
      count: batch.assets.length,
      limit: options?.binaryRequestLimit,
      jobId: this.#config.jobId,
      batchId,
    };
    this.#log.info('Retrieved batch', {
      ...batchInfo,
      getBatchDuration: Date.now() - batchStart,
    });
    const binaryStart = Date.now();
    const resolved = (
      await mapLimit(
        batch.assets,
        options?.binaryRequestLimit || 1,
        async (data) => {
          let { binary } = data;
          // some extractors may be able to provide binary information with the asset
          // itself, eliminating the need to perform a second request
          if (!binary) {
            try {
              binary = await extractor.getBinaryRequest(data.id, data);
            } catch (err) {
              this.#log.warn('Failed to retrieve binary', {
                batchInfo,
                assetId: data.assetId,
              });
            }
          }
          return { data, binary };
        },
      )
    ).filter((it) => it.binary);
    this.#log.info('Retrieved binary requests', {
      ...batchInfo,
      getBinariesDuration: Date.now() - binaryStart,
    });

    const ingestionStart = Date.now();
    this.#log.info('Sending assets', batchInfo);
    await forEachLimit(
      resolved,
      options?.ingestLimit || DEFAULT_INGEST_LIMIT,
      async (asset) => {
        await this.submit(asset.data, asset.binary, batchId);
      },
    );
    this.#log.info('Assets ingested', {
      ...batchInfo,
      ingestionDuration: Date.now() - ingestionStart,
      batchDuration: Date.now() - batchStart,
    });
    return { cursor: batch.cursor, more: batch.more };
  }
}
