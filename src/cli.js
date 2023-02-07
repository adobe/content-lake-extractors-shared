/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
/* eslint-disable no-console */

import { parse } from 'url';
import { createServer } from 'http';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { readFile, writeFile } from 'fs/promises';
import { resolve } from 'path';

// eslint-disable-next-line no-unused-vars
import * as auth from './auth.js';
// eslint-disable-next-line no-unused-vars
import * as extract from './extractors.js';

/**
 * Performs an authentication with th
 * @param {auth.OauthAuthenticator} oauthAuthenticator
 *  the authenticator with which to perform the authentication
 * @param {number} port the port number to use when setting up the server on localhost
 */
async function performOauthAuthentication(oauthAuthenticator, port) {
  const server = createServer();
  let handled = false;
  server.on('request', (request, response) => {
    if (request.method === 'GET' && !handled) {
      handled = true;
      const { query } = parse(request.url, true);
      oauthAuthenticator.handleCallback(query).then(() => {
        server.close(() => {
          resolve();
        });
      });
      response.end('Authentication complete, you can now close this window');
      request.socket.unref();
    }
  });

  const authenticationUrl = await oauthAuthenticator.getAuthenticationUrl(
    `http://localhost:${port}`,
  );
  server.listen(port, () => {
    console.log(`Open this URL to authenticate: ${authenticationUrl}`);
  });
}

async function writeConfig(configFile, config) {
  await writeFile(configFile, JSON.stringify(config));
}

async function parseConfig(config) {
  async function doParse() {
    return JSON.parse((await readFile(config)).toString());
  }
  try {
    const parsed = await doParse();
    parsed.refreshTokenUpdateListener = async (refreshToken) => {
      const newConfig = await doParse();
      newConfig.refreshToken = refreshToken;
      writeConfig(config, newConfig);
    };
    return parsed;
  } catch (err) {
    throw new Error(`Failed to parse configuration: ${config}: ${err}`);
  }
}

/**
 * a function to get the extractor from the configuration
 * @callback GetExtractorFn
 * @param {any} config
 * @returns {Promise<extract.Extractor>}
 */

/**
 * the authenticator if oauth authentication is requred
 * @callback GetOauthAuthenicatorFn
 * @param {any} config
 * @returns {Promise<auth.OauthAuthenticator | undefined>}
 */

/**
 * @typedef CliConfig the configuration for the cli function
 * @property {string[]} args the arguments from the command line
 * @property {string} name the name of the extractor
 * @property {GetExtractorFn} getExtractor
 *  a function to get the extractor from the configuration
 * @property {GetOauthAuthenicatorFn} getOauthAuthenicator
 *  the authenticator if oauth authentication is requred
 */

/**
 * Parse the arguments from the current process and execute the extractor function
 * @param {CliConfig} config the configuration
 */
export function cli(config) {
  const {
    name, args, getExtractor, getOauthAuthenicator,
  } = config;
  // eslint-disable-next-line no-unused-vars
  const cmd = yargs(hideBin(args))
    .scriptName(`content-lake-extractor-${name}`)
    .usage('$0 <cmd> [args]')
    .option('config', {
      describe: 'the configuration JSON file for the extractor',
      requiresArg: true,
      default: `.${name}-cfg.json`,
    })
    .command(
      'get-assets',
      'Gets the assets with the specified configuraton',
      (yargsCfg) => {
        yargsCfg.option('cursor', {
          describe: 'the cursor for fetching the next set of results',
          requiresArg: true,
        });
      },
      async (argv) => {
        const extractor = await getExtractor(await parseConfig(argv.config));
        const res = await extractor.getAssets(argv.cursor);
        console.log('Retrieved assets:');
        console.log(res);
      },
    )
    .command(
      'get-binary-request',
      'Gets the request description to make to get an asset binary',
      (yargsCfg) => {
        yargsCfg.option('asset-id', {
          describe: 'the id of the asset to retrieve',
          type: 'string',
          requiresArg: true,
          demandOption: true,
        });
      },
      async (argv) => {
        const extractor = await getExtractor(await parseConfig(argv.config));
        const res = await extractor.getBinaryRequest(argv['asset-id'], argv);
        console.log('Retrieved asset binary request:');
        console.log(res);
      },
    )
    .command(
      'get-folders',
      'Gets the children of the specified folder (or the root)',
      (yargsCfg) => {
        yargsCfg.option('parent-id', {
          describe: 'the parent id for which to search',
          type: 'string',
          requiresArg: true,
        });
      },
      async (argv) => {
        const extractor = await getExtractor(await parseConfig(argv.config));
        const res = await extractor.getFolders(argv['parent-id']);
        console.log('Retrieved folders:');
        console.log(res);
      },
    )
    .command(
      'authenticate',
      'Authenticates the extractor, returning a refresh token',
      (yargsCfg) => {
        yargsCfg.option('port', {
          describe: 'the port for the local server to start',
          type: 'number',
          requiresArg: true,
          default: 3000,
        });
      },
      async (argv) => {
        const parsed = await parseConfig(argv.config);
        if (!getOauthAuthenicator) {
          console.log('Extractor does not support OAuth, skipping authentication!');
          return;
        }
        const authenticator = await getOauthAuthenicator(parsed);
        await performOauthAuthentication(authenticator, argv.port);
        console.log('Authenticated successfully!');
      },
    )
    .demandCommand()
    .help().argv;
}
