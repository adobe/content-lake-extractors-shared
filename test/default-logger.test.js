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

import { DefaultLogger } from '../src/default-logger.js';

describe('Default Logger Tests', () => {
  let prevLevel;

  function setLogLevel(level) {
    if (!DefaultLogger.logLevel) {
      prevLevel = DefaultLogger.logLevel;
    }
    DefaultLogger.logLevel = level;
  }

  function restoreLogLevel() {
    if (prevLevel) {
      DefaultLogger.logLevel = prevLevel;
    }
  }

  it('test debug', () => {
    setLogLevel('DEBUG');
    DefaultLogger.debug('test debug message');
    restoreLogLevel();
  });

  it('test info', () => {
    setLogLevel('INFO');
    DefaultLogger.info('test info message');
    restoreLogLevel();
  });

  it('test warn', () => {
    setLogLevel('WARN');
    DefaultLogger.warn('test warn message');
    restoreLogLevel();
  });

  it('test error', () => {
    setLogLevel('ERROR');
    DefaultLogger.error('test error message');
    restoreLogLevel();
  });
});
