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

import { BaseBatchProvider } from '../../src/batch-provider.js';

/**
 * @typedef MockBatch
 * @property {boolean} [shouldProcess=true] Whether or not the batch should be processed.
 * @property {Array} [children=[]] The children items that will be included in the batch.
 */

/**
 * Mock implementation of a batch provider, which allows the consumer to configure the
 * nodes that it will process.
 */
export class MockBatchProvider extends BaseBatchProvider {
  #nodes;

  /**
   * @type {Array}
   */
  #processedItems;

  constructor() {
    super();
    this.#nodes = {};
    this.#processedItems = [];
  }

  /**
   * Adds a new node to the batch provider. The node and all of its descendents
   * will be added to the provider.
   * @param {import('./mock-batch-node').MockBatchNode} node Node to
   *  add to the provider.
   * @returns {MockBatchProvider} Current instance, for chaining.
   */
  addNode(node) {
    this.#nodes[node.name] = node;
    node.childNodes.forEach((child) => {
      this.#nodes[child.name] = child;
      this.addNode(child);
    });
    return this;
  }

  /**
   * Retrieved all of the items that went through the batch processor's
   * process() method.
   * @returns {Array} Items that were processed by the provider.
   */
  get processedItems() {
    return this.#processedItems;
  }

  /**
   * Returns the next batch of items
   * @param {string} item The name of the node whose children should be retrieved.
   * @returns {Promise<Array<import('./mock-batch-node').MockBatchNode>>}
   */
  async getBatch(item) {
    if (this.#nodes[item]) {
      return this.#nodes[item].children;
    }
    return [];
  }

  /**
   * Checks whether or not there are more items which can be retrieved from the current item
   * @param {any} item the item to check if there are more items
   * @returns {Promise<boolean>}
   */
  async hasMore(item) {
    if (this.#nodes[item]) {
      return this.#nodes[item].children.length > 0;
    }
    return false;
  }

  /**
   * Processes the specified item
   * @param {any} item the item to process
   * @returns {Promise<void>}
   */
  async process(item) {
    this.#processedItems.push(item);
  }

  /**
   * Checks if the item should be processed.
   * @param {any} item the item to evaluate if it should be processed
   * @returns {Promise<boolean>} true if the item should be processed
   */
  async shouldProcess(item) {
    if (this.#nodes[item]) {
      return this.#nodes[item].processable;
    }
    return false;
  }
}
