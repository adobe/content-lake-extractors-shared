import { parse } from "url";
import { createServer } from "http";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

import * as auth from "./auth.js";
import * as extract from "./extractors.js";

/**
 * Performs an authentication with th
 * @param {auth.OauthAuthenticator} oauthAuthenticator the authenticator with which to perform the authentication
 * @param {number} port the port number to use when setting up the server on localhost
 */
async function performOauthAuthentication(oauthAuthenticator, porr) {
  const server = createServer();
  server.on("request", (request, response) => {
    const { query } = parse(request.url, true);
    oauthAuthenticator.handleCallback(query).then(() => {
      server.closeAllConnections();
      server.close((err) => {
        resolve();
      });
    });
    response.end("Authentication complete, you can now close this window");
  });

  const authenticationUrl = await oauthAuthenticator.getAuthenticationUrl(
    `http://localhost:${port}`
  );
  server.listen(port, () => {
    console.log(`Open this URL to authenticate: ${authenticationUrl}`);
  });
}

function parseConfig(config) {
  if (!existsSync(config)) {
    throw new Error(`Invalid configuration: ${resolve(config)} does not exist`);
  }
  return JSON.parse(readFileSync(config).toString());
}

/**
 * @typedef CliConfig the configuration for the cli function
 * @property {string[]} args the arguments from the command line
 * @property {string} name the name of the extractor
 * @property {(config: any) => Promise<extract.Extractor>} getExtractor a function to get the extractor from the configuration
 * @property {(config: any) => Promise<auth.OauthAuthenticator | undefined>} getOauthAuthenicator the authenticator if oauth authentication is requred
 */

/**
 * Parse the arguments from the current process and execute the extractor function
 * @param {CliConfig} config the configuration
 */
export function cli(config) {
  const { name, args, getExtractor, getOauthAuthenicator } = config;
  const cmd = yargs(hideBin(args))
    .scriptName(`content-lake-extractor-${name}`)
    .usage("$0 <cmd> [args]")
    .option("config", {
      describe: "the configuration JSON file for the extractor",
      requiresArg: true,
      default: `.env/${name}.json`,
    })
    .command(
      "get-assets",
      "Gets the assets with the specified configuraton",
      (yargs) => {
        yargs.option("cursor", {
          describe: "the cursor for fetching the next set of results",
          requiresArg: true,
        });
      },
      async (argv) => {
        const extractor = await getExtractor(parseConfig(argv.config));
        const res = await extractor.getAssets(argv.cursor);
        console.log("Retrieved assets:");
        console.log(res);
      }
    )
    .command(
      "get-binary-request",
      "Gets the request description to make to get an asset binary",
      (yargs) => {
        yargs.option("asset-id", {
          describe: "the id of the asset to retrieve",
          type: "string",
          requiresArg: true,
          demandOption: true,
        });
      },
      async (argv) => {
        const extractor = await getExtractor(parseConfig(argv.config));
        const res = await extractor.getBinaryRequest(argv["asset-id"]);
        console.log("Retrieved asset binary request:");
        console.log(res);
      }
    )
    .command(
      "get-folders",
      "Gets the children of the specified folder (or the root)",
      (yargs) => {
        yargs.option("parent-id", {
          describe: "the parent id for which to search",
          type: "string",
          requiresArg: true,
        });
      },
      async (argv) => {
        const extractor = await getExtractor(parseConfig(argv.config));
        const res = await extractor.getFolders(argv["parent-id"]);
        console.log("Retrieved folders:");
        console.log(res);
      }
    )
    .command(
      "authenticate",
      "Authenticates the extractor, returning a refresh token",
      (yargs) => {
        yargs.option("port", {
          describe: "the port for the local server to start",
          type: "number",
          requiresArg: true,
          default: 3000,
        });
      },
      async (argv) => {
        const authenticator = await getOauthAuthenicator(
          parseConfig(argv.config)
        );
        await performOauthAuthentication(authenticator, argv.port);
        console.log(`Authenticated successfully!`);
      }
    )
    .demandCommand()
    .help().argv;
}
