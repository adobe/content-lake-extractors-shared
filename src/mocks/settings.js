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
 * A mock for the SettingsStore.
 *
 * Either call the put method or set the settings property of this class
 * directly to set the settings
 *
 * @see {SettingsStore}
 */
export class MockSettingsStore {
  settings = {};

  /**
   * Resets the mock to it's original state
   */
  reset() {
    this.settings = {};
  }

  deleteSettings(sourceId) {
    delete this.settings[sourceId];
  }

  getSettings(sourceId) {
    return this.settings[sourceId];
  }

  putSettings(settings) {
    const { sourceId } = settings;
    this.settings[sourceId] = settings;
  }
}