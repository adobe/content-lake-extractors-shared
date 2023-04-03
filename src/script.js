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
/* eslint-disable max-classes-per-file */
import { eachSeries } from 'async';
import { randomUUID } from 'crypto';
import { existsSync } from 'fs';
import { readFile, rm, writeFile } from 'fs/promises';
import { createServer } from 'http';
import { createInterface } from 'readline';
import { Writable } from 'stream';
import { BatchExecutor } from './batch-executor.js';
import { IngestorClient } from './ingestor.js';

/**
 * @typedef {Object} CliConfig
 * @property {string} name
 * @property {Array<Option>} options
 * @property {import('@adobe/content-lake-commons').commonTypes.Logger} [logger]
 */

/**
 * @typedef {Object} Option
 * @property {string} name the name of the option
 * @property {string} [display] an optional display value for the option
 * @property {string} [env] the environment variable from which the default value will be read
 * @property {string} [defaultValue] a static default value
 */

class LogWriter extends Writable {
  #logger;

  constructor(logger) {
    super();
    this.#logger = logger;
  }

  _write(chunk, _encoding, callback) {
    this.#logger.info(chunk.toString('utf-8'));
    callback();
  }
}

const PN_SOURCE_ID = 'SOURCE_ID';
const PN_SPACE_ID = 'SPACE_ID';
const PN_COMPANY_ID = 'COMPANY_ID';
const PN_REFRESH_TOKEN = 'REFRESH_TOKEN';

const PN_INGESTOR_URL = 'INGESTOR_URL';
const PN_INGESTOR_API_KEY = 'INGESTOR_API_KEY';

const PN_STATE_FILE = 'STATE_FILE';
const PN_PROCESS_BATCH_SIZE = 'PROCESS_BATCH_SIZE';

export class ScriptHelper {
  static REDIRECT_URI = 'http://localhost:3000';

  static COMMON_OPTIONS = [
    { name: PN_SOURCE_ID, env: PN_SOURCE_ID, display: 'Source ID' },
    { name: PN_COMPANY_ID, env: PN_COMPANY_ID, display: 'Company ID' },
    { name: PN_SPACE_ID, env: PN_SPACE_ID, display: 'Space ID' },
    { name: PN_REFRESH_TOKEN, env: PN_REFRESH_TOKEN, display: 'Refresh Token' },
  ];

  static INGESTOR_OPTIONS = [
    {
      name: PN_INGESTOR_URL,
      env: PN_INGESTOR_URL,
      display: 'Ingestor Service Url',
    },
    {
      name: PN_INGESTOR_API_KEY,
      env: PN_INGESTOR_API_KEY,
      display: 'Ingestor API Key',
    },
  ];

  static BATCH_OPTIONS = [
    {
      name: PN_STATE_FILE,
      env: PN_STATE_FILE,
      display: 'State File',
    },
    {
      name: PN_PROCESS_BATCH_SIZE,
      env: PN_PROCESS_BATCH_SIZE,
      display: 'Process Batch Size',
    },
  ];

  #logger;

  #config;

  #reader;

  #settings = { REDIRECT_URI: ScriptHelper.REDIRECT_URI };

  /**
   * @param {CliConfig} config
   */
  constructor(config) {
    this.#config = config;
    this.#logger = config.logger || console;
  }

  /**
   * Perform an authentication with the authenticator
   * @param {import('./auth.js').BaseOauthAuthenticator} authenticator
   */
  async authenticate(authenticator) {
    this.#logger.info(`${this.#config.name} - Authenticate`);
    const authUrl = await authenticator.getAuthenticationUrl(
      ScriptHelper.REDIRECT_URI,
    );
    const code = await this.#getCode(authUrl);
    await authenticator.handleCallback({ code });
    this.#logger.info(`Refresh Token: ${authenticator.refreshToken}`);
  }

  async confirm(message) {
    const response = await this.#ask(`${message} [y/Y]:`);
    if (response.toLowerCase() !== 'y') {
      process.exit(1);
    }
  }

  async confirmOptions() {
    this.#reader = createInterface({
      input: process.stdin,
      output: new LogWriter(this.#logger),
    });
    this.#logger.info(`${this.#config.name} - Confirm Options`);
    await eachSeries(this.#config.options, async (op) => this.#confirmOption(op));
    await this.confirm('Ready to proceed?');
  }

  /**
   * @param {string} question
   * @returns {Promise<string>}
   */
  #ask(question) {
    return new Promise((resolve) => {
      this.#reader.question(question, (response) => {
        resolve(response);
        this.#reader.pause();
      });
    });
  }

  /**
   * @returns {boolean} true, if there is a state file
   */
  batchHasSavedState() {
    const stateFile = this.#settings[PN_STATE_FILE] || '.state.json';
    return existsSync(stateFile);
  }

  /**
   * @param {Option} option
   * @returns {Promise<void>}
   */
  async #confirmOption(option) {
    const defaultVal = process.env[option.env];
    const response = await this.#ask(
      `${option.display || option.name} [${defaultVal}]: `,
    );
    if (response && response.trim() !== '') {
      this.#settings[option.name] = response;
    }
    this.#settings[option.name] = defaultVal;
  }

  /**
   * Get the code from an Oauth response
   * @param {string} authUrl the url for the user to login
   * @returns {Promise<string>} the code
   */
  async #getCode(authUrl) {
    const sockets = new Set();
    const server = createServer();
    server.listen(3000, () => {
      this.#logger.info(`Please open: ${authUrl}`);
    });
    server.on('connection', (socket) => {
      sockets.add(socket);
      server.once('close', () => {
        sockets.delete(socket);
      });
    });
    return new Promise((resolve) => {
      server.on('request', (req, res) => {
        const url = new URL(`${ScriptHelper.REDIRECT_URI}${req.url}`);
        const code = url.searchParams.get('code');
        if (code) {
          res.statusCode = 200;
          res.write('Code recieved successfully');
          res.end();
          resolve(code);
        }
      });
    }).finally(() => {
      server.close();
      sockets.forEach((socket) => socket.destroy());
    });
  }

  getIngestorClient() {
    const jobId = randomUUID();
    return new IngestorClient({
      url: this.#settings[PN_INGESTOR_URL],
      apiKey: this.#settings[PN_INGESTOR_API_KEY],
      companyId: this.#settings[PN_COMPANY_ID],
      jobId,
      log: this.#logger,
      spaceId: this.#settings[PN_SPACE_ID],
    });
  }

  getSettings() {
    return this.#settings;
  }

  /**
   *
   * @param {import('./batch-provider.js').BaseBatchProvider} provider
   * @param {*} [root]
   */
  async runBatch(provider, root) {
    this.#logger.info(`${this.#config.name} - Run Batch`);
    const executor = new BatchExecutor(provider, {
      processBatchSize: this.#settings[PN_PROCESS_BATCH_SIZE],
    });

    const stateFile = this.#settings[PN_STATE_FILE] || '.state.json';
    let result;
    if (existsSync(stateFile)) {
      this.#logger.info('Reading state file');
      try {
        const buf = await readFile(stateFile);
        const state = JSON.parse(buf.toString());
        executor.setState(state);
      } catch (err) {
        this.#logger.debug('Failed to read state file', err);
      }
      result = await executor.traverseTree();
    } else {
      this.#logger.info('Starting from root', { root });
      result = await executor.traverseTree(root);
    }

    process.on('SIGINT', () => {
      this.#logger.info('Saving state before exiting');
      executor.running = false;
      executor.moreNodes = false;
      writeFile(stateFile, JSON.stringify(executor.getState())).then(() => process.exit());
    });

    this.#logger.debug('Removing state file');
    await rm(stateFile, { recursive: true });

    this.#logger.info('Batch run successful');
    this.#logger.info(JSON.stringify(result, null, 2));
  }
}
