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

const DEFAULT_BINARY_REQUEST_LIMIT = 1;
const fetch = fetchBuilder(originalFetch);

/**
 * @typedef {Object} IngestionRequest
 * @property {SourceData} data the data extracted from the source
 * @property {BinaryRequest} binary
 *  a description of the request to retrieve the binary for the asset
 * @property {string | undefined} batchId an identifier for the current batch
 */

/**
 * @typedef {Object} SourceData The data extracted from the source
 * @property {string} sourceAssetId the ID of this asset as interpreted by the source system
 * @property {string} sourceType the source from which this asset was retrieved
 * @property {string} sourceId the source from which this asset was retrieved
 * @property {string | undefined} name the name of the asset as interpreted by the source repository
 * @property {number | undefined} size the size of the original asset in bytes
 * @property {Date | undefined} created the time at which the asset was created in the source
 * @property {string | undefined} createdBy an identifier for the principal which created the asset
 * @property {Date | undefined} lastModified the last time the asset was modified
 * @property {string | undefined} lastModifiedBy
 *  an identifier for the principal which last modified the asset
 * @property {string | undefined} path the path to the asset
 * @property {BinaryRequest | undefined} [binary] If provided, information about the request
 *  that can be sent to retrieve the asset's binary data. If missing, the ingestion process will
 *  make a second call to the extractor to retrieve this information.
 */

/**
 * @typedef {Object} BinaryRequest
 *  A description of a HTTP request to make to retrieve a binary
 * @property {string} url the url to connect to in order to retrieve the binary
 * @property {Record<string,string> | undefined} [headers]
 *  headers to send with the request to retrieve the binary
 */

/**
 * @typedef IngestorConfig the configuration for the ingestor client
 * @property {string} url the URL for calling the ingestor
 * @property {string} apiKey the API Key used to call the ingestor
 * @property {string} companyId the id of the company for which this should be ingested
 * @property {string} jobId the id of the current job
 * @property {string} spaceId the id of the space into which this should be ingested
 */

/**
 * @typedef SubmitBatchOptions
 * @property {number | undefined} binaryRequestLimit the limit to the number of parallel requests
 *  to get the binary
 * @property {number | undefined} ingestLimit the limit to the number of parallel requests
 *  to ingest
 */

/**
 * @typedef {Object} SourceDataBatch
 * @property {Array<SourceData>} data the retrieved data from the source
 * @property {boolean} more if more data is available from the source
 * @property {any} cursor
 *  the cursor for retrieving the next batch, should be treated as an opaque value
 */

/**
 * @typedef {Object} GetSourceDataBatchConfig
 * @property {any | undefined} cursor the cursor to resume the request from a point
 * @property {number | undefined} limit the limit for the number to retrieve
 */

/**
 * Retrieves a batch of data to ingest from the source
 * @callback SourceDataBatchFn
 * @param {GetSourceDataBatchConfig} config
 * @returns {Promise<SourceDataBatch>}
 */

/**
 * Retrieves the data for a single record from the source
 * @callback SourceDataFn
 * @param {string} assetSourceId
 * @returns {Promise<SourceData>}
 */

/**
 * Gets the request descriptor to retrieve the binary
 * @callback GetBinaryRequestFn
 * @param {SourceData} data
 * @returns {Promise<BinaryRequest>}
 */

/**
 * @typedef Extractor Extracts data and binary requests from a source
 * @property {SourceDataFn} getSourceData
 *  Retrieves a batch of data from the source
 * @property {SourceDataBatchFn} getSourceDataBatch
 *  Retrieves a batch of data from the source
 * @property {GetBinaryRequestFn} getBinaryRequest
 *  Gets the request descriptor to retrieve the binar
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
   * Filters the data to the specified keys and then merges with the toMerge object.
   * @param {Record<string, any>} data
   * @param {Array<string>} keys
   * @param {Record<string, any>} toMerge
   */
  static #filterAndMerge(data, keys, toMerge) {
    const filtered = {};
    keys.forEach((k) => {
      filtered[k] = data[k];
    });
    return { ...filtered, ...toMerge };
  }

  /**
   * Submits the request for ingestion
   * @param {IngestionRequest} request the request containing the data to ingest
   */
  async submit(request) {
    const start = Date.now();

    const requestId = randomUUID();
    const { spaceId, companyId, jobId } = this.#config;

    const requestInfo = IngestorClient.#filterAndMerge(
      request.data,
      ['assetSourceId', 'sourceId', 'sourceType', 'name'],
      {
        jobId,
        companyId,
        spaceId,
        requestId,
        batchId: request.batchId,
      },
    );

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
      body: JSON.stringify({
        ...request,
        jobId,
        companyId,
        spaceId,
        requestId,
      }),
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
   * @param {Extractor} extractor the extractor from which to get the batch
   * @param {any | undefined} cursor the current cursor
   * @param {SubmitBatchOptions | undefined} options the limit for the number of concurrent requests
   * @returns {any} the next cursor or undefined if no more assets are available
   */
  async submitBatch(extractor, cursor, options) {
    const batchId = randomUUID();
    const batchStart = Date.now();
    const batch = await extractor.getSourceDataBatch({ cursor });
    const batchInfo = {
      skipped: batch.skipped,
      more: batch.more,
      count: batch.data.length,
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
        batch.data,
        options?.binaryRequestLimit || DEFAULT_BINARY_REQUEST_LIMIT,
        async (data) => {
          let { binary } = data;
          // some extractors may be able to provide binary information with the asset
          // itself, eliminating the need to perform a second request
          if (!binary) {
            try {
              binary = await extractor.getBinaryRequest(data);
            } catch (err) {
              this.#log.warn(
                'Failed to retrieve binary',
                IngestorClient.#filterAndMerge(
                  data,
                  ['assetSourceId', 'sourceId', 'sourceType', 'name'],
                  batchInfo,
                ),
              );
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
      async (item) => {
        await this.submit({ ...item, batchId });
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
