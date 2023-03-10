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

import { mapLimit } from 'async';

/**
 * @typedef TraverserResult
 * @property {number} duration
 * @property {Array<{method: string, node: any, error: Error}>} errors
 * @property {number} processed
 * @property {number} traversed
 */

/**
 * @typedef TraverserConfig
 * @property {function(any):any} [formatForLog]
 * @property {function(any):Promise<Array<any>>} getChildrenFn
 * @property {function(any):Promise<boolean>} hasChildrenFn
 * @property {any} log
 * @property {number} [processBatchSize]
 * @property {function(any):Promise<void>} processFn
 * @property {function(any):Promise<boolean>} shouldProcessFn
 * @property {number} [traversalBatchSize]
 * @property {number} [waitDuration]
 */

export class Traverser {
  /**
   * @type {TraverserConfig}
   */
  #config;

  #log;

  #traversalBatch;

  #processingBatch;

  errors = [];

  moreNodes = false;

  running = false;

  processed = 0;

  processingQueue = [];

  traversed = 0;

  traversalQueue = [];

  /**
   * @param {TraverserConfig} config
   */
  constructor(config, state) {
    const missing = [
      'getChildrenFn',
      'hasChildrenFn',
      'processFn',
      'shouldProcessFn',
    ].filter((k) => !(k in config));
    if (missing.length > 0) {
      throw new Error(
        `Invalid TreeTraverserConfig, missing fields: ${missing.join(', ')}`,
      );
    }
    this.#config = {
      ...{
        formatForLog: JSON.stringify,
        processBatchSize: 1,
        traversalBatchSize: 1,
        waitDuration: 100,
      },
      ...config,
    };
    this.#log = config.log || console;

    if (state) {
      this.#log.info('Resuming from state', state);
      this.errors = state.errors;
      this.processed = state.processed;
      this.processingQueue = state.processingQueue;
      this.traversed = state.traversed;
      this.traversalQueue = state.traversalQueue;
      this.#processingBatch = state.processingBatch;
      this.#traversalBatch = state.traversalBatch;
    }
  }

  getState() {
    return {
      errors: this.errors,
      processed: this.processed,
      processingBatch: this.#processingBatch,
      processingQueue: this.processingQueue,
      traversed: this.traversed,
      traversalBatch: this.#traversalBatch,
      traversalQueue: this.traversalQueue,
    };
  }

  /**
   * Performs a depth first traversal of the tree
   * @param {any} root
   * @returns {Promise<TraverserResult>}
   */
  async traverseTree(root) {
    const start = Date.now();
    this.running = true;
    this.moreNodes = true;
    try {
      this.traversalQueue.push(root);
      this.startTraversalQueueProcessor();
      this.startProcessorQueueProcessor();
      let interval = 0;
      while (this.running) {
        // eslint-disable-next-line no-await-in-loop
        await this.#wait();
        interval += 1;
        if (interval % 10 === 0) {
          this.#log.info('Traversal in progress', {
            duration: Date.now() - start,
            errors: this.errors,
            processed: this.processed,
            processingQueueSize: this.processingQueue.length,
            traversed: this.traversed,
            traversalQueueSize: this.traversalQueue.length,
          });
        }
      }
      const result = {
        duration: Date.now() - start,
        errors: this.errors,
        processed: this.processed,
        traversed: this.traversed,
      };
      this.#log.info('Finished traversing tree', result);
      return result;
    } finally {
      this.moreNodes = false;
      this.running = false;
    }
  }

  async startProcessorQueueProcessor() {
    const processingStart = Date.now();
    while (this.moreNodes || this.processingQueue.length > 0) {
      const start = Date.now();
      this.#processingBatch = this.processingQueue.splice(
        0,
        this.processingQueue.length,
      );
      if (this.#processingBatch.length > 0) {
        this.#log.info('Processing batch', {
          batchSize: this.#processingBatch.length,
        });
        // eslint-disable-next-line no-await-in-loop
        await mapLimit(
          this.#processingBatch,
          this.#config.processBatchSize || 1,
          async (node) => {
            try {
              const loggableNode = this.#config.formatForLog(node);
              this.#log.debug('Processing node', loggableNode);
              await this.#config.processFn(node);
              this.processed += 1;
            } catch (err) {
              this.#log.warn('Failed to process node', { node, err });
              this.errors.push({
                method: 'process',
                node,
                err,
              });
            }
          },
        );
        this.#log.info('Batch processed', {
          batchSize: this.#traversalBatch.length,
          duration: Date.now() - start,
        });
      }
      if (this.processingQueue.length === 0) {
        // eslint-disable-next-line no-await-in-loop
        await this.#wait();
      }
    }
    this.#log.info('Processing complete!', {
      duration: Date.now() - processingStart,
      traversed: this.traversed,
    });
    this.running = false;
  }

  async startTraversalQueueProcessor() {
    const traversalStart = Date.now();
    while (this.traversalQueue.length > 0) {
      const batchStart = Date.now();
      this.#traversalBatch = this.traversalQueue.splice(
        0,
        this.traversalQueue.length,
      );
      this.#log.info('Traversing batch', {
        batchSize: this.#traversalBatch.length,
      });
      // eslint-disable-next-line no-await-in-loop
      await mapLimit(
        this.#traversalBatch,
        this.#config.traversalBatchSize || 1,
        async (node) => this.#traverseNode(node),
      );
      this.#log.info('Batch traversed', {
        batchSize: this.#traversalBatch.length,
        duration: Date.now() - batchStart,
      });
    }
    this.#log.info('Traversal complete!', {
      duration: Date.now() - traversalStart,
      traversed: this.traversed,
    });
    this.moreNodes = false;
  }

  async #traverseNode(node) {
    let canRetry = typeof node.TRAVERSAL_RETRY === 'undefined';
    try {
      let children;
      const loggableNode = this.#config.formatForLog(node);
      this.#log.debug('Traversing node', loggableNode);
      const hasChildren = await this.#config.hasChildrenFn(node);
      if (hasChildren) {
        children = await this.#config.getChildrenFn(node);
        if (children.length > 0) {
          this.#log.debug('Found children', {
            node: loggableNode,
            count: children.length,
          });
        }
      }
      const shouldProcess = await this.#config.shouldProcessFn(node);

      canRetry = false; // done with read-only changes, any failures after this and we can't retry

      children?.forEach((c) => this.traversalQueue.push(c));
      if (shouldProcess) {
        this.#log.debug('Adding node to processing queue', loggableNode);
        this.processingQueue.push(node);
      }
      this.traversed += 1;
    } catch (err) {
      this.#log.warn('Failed to traverse node', { node, err });
      if (canRetry) {
        this.traversalQueue.push({ ...node, TRAVERSAL_RETRY: true });
      } else {
        this.errors.push({
          method: 'traverse',
          node,
          err,
        });
      }
    }
  }

  async #wait() {
    return new Promise((resolve) => {
      setTimeout(resolve, this.#config.waitDuration);
    });
  }
}
