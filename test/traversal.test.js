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
/* eslint-env mocha */

import assert from 'assert';
import util from 'util';
import { traversal } from '../src/index.js';

const noOpConfig = {
  getChildrenFn: () => [],
  hasChildrenFn: () => false,
  processFn: () => {},
  shouldProcessFn: () => false,
};

const sleep = util.promisify(setTimeout);

describe('Traversal Tests', () => {
  it('requires fields', () => {
    let caught;
    try {
      const traverser = new traversal.Traverser({});
      assert.ok(traverser);
    } catch (err) {
      caught = err;
    }
    assert.ok(caught);
  });

  it('can reload state', () => {
    const state = {
      errors: ['bad'],
      processed: 1,
      processingQueue: ['file3'],
      traversed: 1,
      traversalQueue: ['folder3'],
      processingBatch: ['file2'],
      traversalBatch: ['folder2'],
    };
    const traverser = new traversal.Traverser(noOpConfig, state);
    [
      'errors',
      'processed',
      'processingQueue',
      'traversed',
      'traversalQueue',
    ].forEach((k) => {
      assert.strictEqual(
        traverser[k],
        state[k],
        `Mismatched key ${k} in traverser`,
      );
    });
    const newState = traverser.getState();
    Object.keys(state).forEach((k) => {
      assert.strictEqual(
        newState[k],
        state[k],
        `Mismatched key ${k} in new state`,
      );
    });
  });

  it('will terminate', async () => {
    const traverser = new traversal.Traverser(noOpConfig);
    const res = await traverser.traverseTree('');
    assert.ok(res);
  });

  it('will process remaining queue items', async () => {
    const traverser = new traversal.Traverser(
      { ...noOpConfig, processFn: async () => sleep(2000) },
      {
        errors: [],
        processed: 2,
        processingQueue: ['file3'],
        traversed: 2,
        traversalQueue: [],
        processingBatch: [],
        traversalBatch: [],
      },
    );
    const res = await traverser.traverseTree('');
    assert.ok(res);
    assert.strictEqual(traverser.processingQueue.length, 0);
    assert.strictEqual(traverser.processed, 3);
  }).timeout(2500);

  it('handles processor errors', async () => {
    const traverser = new traversal.Traverser(
      {
        ...noOpConfig,
        processFn: async () => {
          throw new Error('bad');
        },
      },
      {
        errors: [],
        processed: 2,
        processingQueue: ['file3'],
        traversed: 2,
        traversalQueue: [],
        processingBatch: [],
        traversalBatch: [],
      },
    );
    const res = await traverser.traverseTree('');
    assert.ok(res);
    assert.strictEqual(traverser.processingQueue.length, 0);
    assert.strictEqual(traverser.processed, 2);
    assert.strictEqual(traverser.errors.length, 1);
    assert.strictEqual(traverser.errors[0].node, 'file3');
    assert.ok(traverser.errors[0].err);
  });

  it('can traverse tree', async () => {
    const familyTree = {
      name: 'Sue',
      child: {
        name: 'Dan',
        granchild1: {
          name: 'Sarah',
        },
        granchild2: {
          name: 'Will',
        },
      },
      child2: {
        name: 'Megan',
        granchild1: {
          name: 'Charles',
        },
        granchild2: {
          name: 'Clara',
        },
      },
      child3: {
        name: 'Mara',
      },
    };

    const names = new Set();
    const traverser = new traversal.Traverser({
      getChildrenFn: async (node) => {
        await sleep(10);
        return Object.keys(node).map((k) => node[k]);
      },
      hasChildrenFn: (node) => typeof node !== 'string',
      processFn: async (node) => {
        await sleep(10);
        names.add(node);
      },
      shouldProcessFn: (node) => typeof node === 'string',
    });
    const res = await traverser.traverseTree(familyTree);
    assert.ok(res);
    assert.strictEqual(traverser.processingQueue.length, 0);
    assert.strictEqual(traverser.traversalQueue.length, 0);
    assert.strictEqual(traverser.processed, 8);
    assert.strictEqual(traverser.traversed, 16);
    assert.strictEqual(traverser.errors.length, 0);
  });

  it('will retry on failure', async () => {
    const traverser = new traversal.Traverser(
      {
        ...noOpConfig,
        hasChildrenFn: (node) => {
          const shouldThrow = node.values.shift();
          if (shouldThrow) {
            throw new Error('sad');
          }
          return false;
        },
      },
      {
        errors: [],
        processed: 0,
        processingQueue: [],
        traversed: 0,
        traversalQueue: [
          { values: [false] },
          { values: [true, false] },
          { values: [true, true, false] },
        ],
        processingBatch: [],
        traversalBatch: [],
      },
    );
    const res = await traverser.traverseTree({ values: [] });
    assert.ok(res);
    assert.strictEqual(traverser.traversalQueue.length, 0);
    assert.strictEqual(traverser.traversed, 3);
    assert.strictEqual(traverser.errors.length, 1);
  });
});
