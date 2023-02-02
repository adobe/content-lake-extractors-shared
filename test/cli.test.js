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
import { spawnSync } from 'child_process';

describe('CLI Test', function () {
  this.timeout(60000);
  it('can get assets', async () => {
    const res = spawnSync('node', [
      'test/mocks/mockcli.js',
      'get-assets',
      '--config',
      'test/mocks/config.json',
    ]);

    assert(res.stderr.toString() === '');
    assert(res.stdout.toString().includes('Retrieved assets:'));
  });

  it('can get assets with cursor', async () => {
    const res = spawnSync('node', [
      'test/mocks/mockcli.js',
      'get-assets',
      '--config',
      'test/mocks/config.json',
      '--cursor',
      '1',
    ]);
    assert.strictEqual('', res.stderr.toString());
    assert(res.stdout.toString().includes('Retrieved assets:'));
  });

  it('will fail with no config', async () => {
    const res = spawnSync('node', [
      'test/mocks/mockcli.js',
      'get-assets',
      '--config',
      'notafile.json',
    ]);
    assert(
      res.stderr
        .toString()
        .includes('Error: Failed to parse configuration: notafile.json'),
    );
  });

  it('can get binary request', async () => {
    const res = spawnSync('node', [
      'test/mocks/mockcli.js',
      'get-binary-request',
      '--config',
      'test/mocks/config.json',
      '--asset-id',
      '1',
    ]);
    assert(res.stderr.toString() === '');
    assert(res.stdout.toString().includes('Retrieved asset binary request:'));
  });

  it('can get folders', async () => {
    const res = spawnSync('node', [
      'test/mocks/mockcli.js',
      'get-folders',
      '--config',
      'test/mocks/config.json',
      '--parent-id',
      '1',
    ]);
    assert(res.stderr.toString() === '');
    assert(res.stdout.toString().includes('Retrieved folders:'));
  });

  it('can skip authentication', async () => {
    const res = spawnSync('node', [
      'test/mocks/mockcli.js',
      'authenticate',
      '--config',
      'test/mocks/config.json',
      '--port',
      '3000',
    ]);
    assert(res.stderr.toString() === '');
    assert(res.stdout.toString().includes('skipping authentication!'));
  });
});
