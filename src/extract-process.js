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

import { LoggingSupport } from './logging-support.js';
import { ExtractError } from './extract-error.js';
import { IngestorClient } from './ingestor.js';
import { FunctionRunner } from './functions.js';

/**
 * @typedef ExtractProcessConfig
 * @property {import('./logging-support.js').Logger} [log] Logger that the process will
 *  use to log messages.
 * @property {import('./extractors.js').Extractor} extractor Extractor that will be
 *  used to perform the extraction.
 */

/**
 * @typedef AwsCredentials
 * @property {string} accessKeyId ID for the AWS access key to use for authentication.
 * @property {string} secretAccessKey Secret for the AWS access key to use for
 *  authentication.
 * @property {string} [sessionToken] If provided, token for the session to use for
 *  AWS authentication.
 */

/**
 * @typedef ExtractInfo
 * @property {string} spaceId Identifier for the space from which the assets should
 *  be extracted.
 * @property {string} sourceId Identifier for the source from which the assets should
 *  be extracted.
 * @property {string} jobId Identifier for the current extract job execution.
 * @property {string} ingestorApiKey API key to use when ingesting extracted assets.
 * @property {string} ingestorUrl URL of the ingestion endpoint to use to ingest
 *  extracted assets.
 * @property {string} extractorId Identifier that can be used to determine which
 *  extractor should be used for subsequent pages.
 * @property {AwsCredentials} credentials Credentials to use when communicating
 *  with AWS.
 */

/**
 * The process that uses an extractor to iterate pages of assets that should be
 * extracted and ingested.
 */
export class ExtractProcess extends LoggingSupport {
  /**
   * @type {import('./extractors.js').Extractor}
   */
  #extractor;

  /**
   * @type {import('./ingestor.js').IngestorClient}
   */
  #ingestorClient;

  /**
   * @type {import('./functions.js').FunctionRunner}
   */
  #functionRunner;

  /**
   * Constructs a new instance of the process using the given configuration.
   * @param {ExtractProcessConfig} config Controls how the extract process
   *  will behave.
   * @param {import('./ingestor.js').IngestorClient} [ingestorClient] If
   *  provided, the ingestor client that the extraction process will use
   *  to ingest assets. Will default to the shared library's ingestor.
   * @param {import('./functions.js').FunctionRunner} [functionRunner] If
   *  provided, the function runner that the extraction process will use
   *  to queue additional extraction requests. Will default to the shared
   *  library's function runner.
   */
  constructor(config, ingestorClient, functionRunner) {
    super(config);
    this.#extractor = config?.extractor;
    this.#ingestorClient = ingestorClient;
    this.#functionRunner = functionRunner;
  }

  /**
   * Retrieves an extractor that the process can use to retrieve pages of assets.
   * @returns {import('./extractors.js').Extractor} Extractor to use to run
   *  the extraction process.
   */
  #getExtractor() {
    if (!this.#extractor) {
      throw ExtractError.internalServerError('Extract process requires an extractor.');
    }
    return this.#extractor;
  }

  /**
   * Retrieves the client that the extraction process should use to interact with
   * the ingestion service.
   * @param {ExtractInfo} extractInfo Information about the current extraction
   *  operation.
   * @returns {import('./ingestor.js').IngestorClient} Client for ingesting
   *  assets.
   */
  getIngestorClient(extractInfo) {
    if (!this.#ingestorClient) {
      this.#ingestorClient = new IngestorClient({
        log: this.getLogger(),
        apiKey: extractInfo.ingestorApiKey,
        url: extractInfo.ingestorUrl,
      });
    }
    return this.#ingestorClient;
  }

  /**
   * Retrieves a function runner that can be used to asynchronously invoke function
   * operations.
   * @param {ExtractInfo} extractInfo Information about the current extraction
   *  operation.
   * @returns {import('./functions.js').FunctionRunner} Can be used to invoke
   *  function executions.
   */
  getFunctionRunner(extractInfo) {
    if (!this.#functionRunner) {
      this.#functionRunner = new FunctionRunner(extractInfo);
    }
    return this.#functionRunner;
  }

  /**
   * Uses the process's underlying extractor to retrieve a page's worth of data, then
   * queue the next page, if applicable.
   * @param {ExtractInfo} extractInfo Definition for the extraction to execute. This info may vary,
   *  but must at least include the properties specified. It may include additional information
   *  as required by individual extractors.
   * @returns {Promise<*>} Resolves with the payload that was queued as the
   *  next page. Will be falsy if there was not a next page.
   */
  async extract(extractInfo) {
    let nextInfo = false;
    const ingestorClient = this.getIngestorClient(extractInfo);
    const nextPage = await ingestorClient.submitBatch(this.#getExtractor(), extractInfo, 1);
    const cursor = nextPage?.cursor;
    const more = !!nextPage?.more;

    if (cursor !== undefined) {
      this.getLogger().info('Extraction process received a next cursor.');

      if (more) {
        this.getLogger().info('Extraction process has cursor and more results, queueing next event.');

        nextInfo = await this.queueNextPage({
          ...extractInfo,
          cursor,
        });
      } else {
        this.getLogger().info('Extraction process did not provide more results, ending process.');
      }
    } else {
      this.getLogger().info('Extraction process did not provide a next cursor.');
    }
    return nextInfo;
  }

  /**
   * Queues up the next page that should be extracted by the process.
   * @param {ExtractInfo} nextInfo Definition for the next extraction definition
   *  to execute.
   * @returns {Promise<*>} Resolves with the payload that was queued as the
   *  next page.
   */
  async queueNextPage(nextInfo) {
    const functionName = nextInfo.extractorId;
    this.getLogger().debug(`Invoking function ${functionName} with payload`);

    const payload = {
      ...nextInfo,
    };

    // remove sensitive information from the payload
    delete payload.credentials;
    delete payload.ingestorApiKey;
    delete payload.ingestorUrl;
    delete payload.extractorId;

    await this.getFunctionRunner(nextInfo).invokeFunction(
      functionName,
      payload,
    );

    return payload;
  }
}
