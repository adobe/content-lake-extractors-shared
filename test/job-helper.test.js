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
import { JobHelper } from '../src/job-helper.js';
import { MockSettingsStore } from '../src/mocks/settings.js';

describe('JobHelper Unit Tests', () => {
  const settingsStore = new MockSettingsStore();
  const jobHelper = new JobHelper(settingsStore);

  beforeEach(async () => {
    settingsStore.reset();
    await settingsStore.putSettings({
      sourceId: 'test-source',
      currentJobId: 'FULL::test-job',
      currentJobStatus: 'RUNNING',
      currentJobStarted: new Date().toISOString(),
    });
  });

  describe('complete', () => {
    it('can complete', async () => {
      await jobHelper.complete('FULL::test-job', 'test-source', 'test-cursor');
      const settings = await settingsStore.getSettings('test-source');
      assert.strictEqual(settings.cursor, 'test-cursor');
      assert.ok(settings.currentJobDone);
      assert.strictEqual(
        settings.currentJobStatus,
        JobHelper.JOB_STATUS.COMPLETE,
      );
    });

    it('complete only updates cursor for update job', async () => {
      await jobHelper.complete(
        'UPDATE::test-job',
        'test-source',
        'test-cursor',
      );
      const settings = await settingsStore.getSettings('test-source');
      assert.strictEqual(settings.cursor, 'test-cursor');
      assert.strictEqual(
        settings.currentJobStatus,
        JobHelper.JOB_STATUS.RUNNING,
      );
    });

    it('complete skips non-current job', async () => {
      await jobHelper.complete(
        'FULL::test-job2',
        'test-source',
        'test-cursor',
      );
      const settings = await settingsStore.getSettings('test-source');
      assert.ok(!settings.cursor);
      assert.strictEqual(
        settings.currentJobStatus,
        JobHelper.JOB_STATUS.RUNNING,
      );
      assert.ok(!settings.currentJobDone);
    });
  });

  describe('stop', () => {
    it('can stop', async () => {
      await jobHelper.stop('FULL::test-job', 'test-source');
      const settings = await settingsStore.getSettings('test-source');
      assert.strictEqual(
        settings.currentJobStatus,
        JobHelper.JOB_STATUS.STOPPED,
      );
      assert.ok(settings.currentJobDone);
    });

    it('stop skips update job', async () => {
      await jobHelper.stop('UPDATE::test-job', 'test-source');
      const settings = await settingsStore.getSettings('test-source');
      assert.strictEqual(
        settings.currentJobStatus,
        JobHelper.JOB_STATUS.RUNNING,
      );
      assert.ok(!settings.currentJobDone);
    });

    it('stop skips non-current job', async () => {
      await jobHelper.stop('FULL::test-job2', 'test-source');
      const settings = await settingsStore.getSettings('test-source');
      assert.strictEqual(
        settings.currentJobStatus,
        JobHelper.JOB_STATUS.RUNNING,
      );
      assert.ok(!settings.currentJobDone);
    });
  });
});
