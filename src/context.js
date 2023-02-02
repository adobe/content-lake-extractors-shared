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
 * Loads the configuration keys from an environment variable map
 * @param {Record<string,string>} env the environment variables map
 * @returns the configuration to use
 */
export function extractCredentials(env) {
  const config = {
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_ACCESS_SECRET_KEY || env.AWS_SECRET_ACCESS_KEY,
    },
  };
  if (env.AWS_SESSION_TOKEN) {
    config.credentials.sessionToken = env.AWS_SESSION_TOKEN;
  }
  return config;
}

export function getLog(context) {
  return context.log || console;
}

export function extractOriginalEvent(context) {
  return context.invocation?.event;
}
