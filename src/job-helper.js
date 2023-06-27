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

export class JobHelper {
  #settingsStore;

  static JOB_STATUS = Object.seal({
    RUNNING: 'RUNNING',
    STOPPED: 'STOPPED',
    COMPLETE: 'COMPLETE',
  });

  /**
   * @param {import("./settings.js").SettingsObject} sourceSettings
   * @param {string} jobId
   * @returns {boolean} True if the jobId is a full job, matches the
   *  currentJobId and is in a RUNNING state.
   */
  static isCurrentRunningJob(sourceSettings, jobId) {
    return (
      jobId.startsWith('FULL::')
      && sourceSettings.currentJobId === jobId
      && sourceSettings.currentJobStatus === JobHelper.JOB_STATUS.RUNNING
    );
  }

  /**
   * @param {string} jobId
   * @returns {boolean} true if the jobId is for an update job, false otherwise
   */
  static isUpdateJob(jobId) {
    return jobId.startsWith('UPDATE::');
  }

  /**
   *
   * @param {import("./settings.js").SettingsStore} settingsStore
   */
  constructor(settingsStore) {
    this.#settingsStore = settingsStore;
  }

  /**
   * Gets the settings
   * @param {string} sourceId
   */
  async #getSettings(sourceId) {
    return this.#settingsStore.getSettings(sourceId);
  }

  /**
   * Sets the currentJobId to completed if the passed jobId matches the currentJobId for the source.
   * Otherwise it will update the cursor if the job is an update job.
   *
   * @param {string} jobId
   * @param {string} sourceId
   * @param {string} cursor
   */
  async complete(jobId, sourceId, cursor) {
    const sourceSettings = await this.#getSettings(sourceId);
    const currentRunningJob = JobHelper.isCurrentRunningJob(
      sourceSettings,
      jobId,
    );
    if (currentRunningJob) {
      sourceSettings.currentJobStatus = JobHelper.JOB_STATUS.COMPLETE;
      sourceSettings.currentJobDone = new Date().toISOString();
    }
    if (currentRunningJob || JobHelper.isUpdateJob(jobId)) {
      sourceSettings.cursor = cursor;
      await this.#settingsStore.putSettings(sourceSettings);
    }
  }

  /**
   * Checks if the job should be stopped
   * @param {string} jobId
   * @param {string} sourceId
   * @returns {Promise<boolean>} true if processing should be stopped, false otherwise
   */
  async shouldStop(jobId, sourceId) {
    if (JobHelper.isUpdateJob(jobId)) {
      return false;
    }
    const sourceSettings = await this.#getSettings(sourceId);
    return !JobHelper.isCurrentRunningJob(sourceSettings, jobId);
  }

  /**
   * Stops the currently executing job if the jobId matches the currentJobId
   * @param {string} jobId
   * @param {string} sourceId
   */
  async stop(jobId, sourceId) {
    const sourceSettings = await this.#getSettings(sourceId);
    if (JobHelper.isCurrentRunningJob(sourceSettings, jobId)) {
      sourceSettings.currentJobStatus = JobHelper.JOB_STATUS.STOPPED;
      sourceSettings.currentJobDone = new Date().toISOString();
      await this.#settingsStore.putSettings(sourceSettings);
    }
  }
}
