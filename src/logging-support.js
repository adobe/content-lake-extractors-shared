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

import { DefaultLogger } from './default-logger.js';

/**
 * @typedef Logger
 * @property {function} debug Logs a message at the DEBUG level. Behaves similar to
 *  console.log(), in that it supports message formatting.
 * @property {function} info Logs a message at the INFO level. Behaves similar to
 *  console.log(), in that it supports message formatting.
 * @property {function} warn Logs a message at the WARN level. Behaves similar to
 *  console.log(), in that it supports message formatting.
 * @property {function} error Logs a message at the ERROR level. Behaves similar to
 *  console.log(), in that it supports message formatting.
 */

/**
 * @typedef LoggerConfig
 * @property {Logger} [log] The logger to be used to log messages. Will default to
 *  a logger that logs to the console, but only when a certain environment variable
 *  is set.
 */

/**
 * An object that provides capabilities for logging messages.
 */
export class LoggingSupport {
  /**
   * @type {Logger}
   */
  #log;

  /**
   * Constructs a new instance that will use the given configuration.
   * @param {LoggerConfig} config Configuration for the logger.
   */
  constructor(config = {}) {
    this.#log = config.log || DefaultLogger;
  }

  /**
   * Retrieves a logger instance that can be used to log messages.
   * @returns {Logger} Logger, which will have methods debug(), info(),
   *  warn(), and error().
   */
  getLogger() {
    return this.#log;
  }
}
