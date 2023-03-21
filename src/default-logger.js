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

const LOG_LEVEL = process.env.EXTRACTOR_LOG_LEVEL;

/**
 * Class that will serve as the default logger for the module when none is provided.
 * Will only write messages if a EXTRACTOR_LOG_LEVEL environment variable is
 * set to the log level to write.
 */
export class DefaultLogger {
  static #level = LOG_LEVEL;

  /**
   * The log level that the logger will use to determine whether to log messages.
   */
  static set logLevel(level) {
    DefaultLogger.#level = level;
  }

  /**
   * The log level that the logger will use to determine whether to log messages.
   */
  static get logLevel() {
    return DefaultLogger.#level;
  }

  /**
   * Logs a message at the debug level.
   */
  static debug(...theArguments) {
    if (DefaultLogger.logLevel === 'DEBUG') {
      // eslint-disable-next-line no-console
      console.debug.apply(null, theArguments);
    }
  }

  /**
   * Logs a message at the info level.
   */
  static info(...theArguments) {
    if (DefaultLogger.logLevel === 'DEBUG' || DefaultLogger.logLevel === 'INFO') {
      // eslint-disable-next-line no-console
      console.info.apply(null, theArguments);
    }
  }

  /**
   * Logs a message at the warn level.
   */
  static warn(...theArguments) {
    if (DefaultLogger.logLevel === 'DEBUG' || DefaultLogger.logLevel === 'INFO' || DefaultLogger.logLevel === 'WARN') {
      // eslint-disable-next-line no-console
      console.warn.apply(null, theArguments);
    }
  }

  /**
   * Logs a message at the error level.
   */
  static error(...theArguments) {
    if (DefaultLogger.logLevel === 'DEBUG' || DefaultLogger.logLevel === 'INFO' || DefaultLogger.logLevel === 'WARN' || DefaultLogger.logLevel === 'ERROR') {
      // eslint-disable-next-line no-console
      console.error.apply(null, theArguments);
    }
  }
}
