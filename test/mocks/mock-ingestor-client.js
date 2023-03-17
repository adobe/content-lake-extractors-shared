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

/**
 * Mock implementation of an ingestor client from the shared
 * extractor library.
 */
export class MockIngestorClient {
  /**
   * @type {Array}
   */
  #batches;

  /**
   * @type {number}
   */
  #nextCursor;

  /**
   * Constructs a new instance of the client.
   */
  constructor() {
    this.#batches = [];
    this.#nextCursor = false;
  }

  /**
   * Does nothing special with the log.
   * @returns {MockIngestorClient} Current instance, for chaining.
   */
  withLog() {
    return this;
  }

  /**
   * Sets the next cursor value that the submitBatch() method
   * should return.
   * @param {number} cursor A cursor value.
   * @param {boolean} more Value indicating whether the cursor should indicate that
   *  there are more results.
   */
  nextCursor(cursor, more = true) {
    this.#nextCursor = { cursor, more };
  }

  /**
   * Adds the parameters received by this method to the mock client's
   * list of batches.
   * @param {*} extractor Extract for driving the batch.
   * @param {number} cursor Cursor for the current batch.
   * @returns {number} Cursor for the next batch, as defined by nextCursor().
   */
  submitBatch(extractor, cursor) {
    this.#batches.push({
      extractor,
      cursor,
    });
    const next = this.#nextCursor;
    this.#nextCursor = false;
    return next;
  }

  /**
   * All the batches that the mock ingestor client has processed.
   */
  get batches() {
    return this.#batches;
  }
}
