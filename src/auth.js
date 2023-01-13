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
 * @typedef OauthAuthenticator
 * @property {string | undefined} accessToken The current access token or undefined if no token is available
 * @property {Date | undefined} expiration The date at which the access token will expire
 * @property {string | undefined} refreshToken The current, long lived refresh token or undefined if no token is available
 * @property {(refreshToken: string) => Promise<void> | undefined} refreshTokenUpdateListener Listener for updates to the refresh token.
 *
 * @property {(redirectUri: string) => Promise<string>} getAuthenticationUrl Refreshes the access token
 * @property {(queryParams: Record<string,string>) => Promise<void>} handleCallback Handles the callback redirect from an OAuth request
 * @property {() => Promise<void> } refreshAuthentication Gets the authentication URL, e.g. the URL to which the user should be redirected to authenicate
 * @property {() => Promise<boolean> } requiresReauthentication Returns true if the connector requires re-authentication, false otherwise
 */

/**
 * Ensures the oauth authenticator is authenticated, will attempt to retrieve a new access token if the access token is expired or not available
 * @param {OauthAuthenticator} auth the authenticator to check
 */
export async function ensureAuthenticated(auth) {
  const requiresReauth = await auth.requiresReauthentication();
  if (requiresReauth) {
    throw new Error(`Reauthentication requred`);
  }
  // add 5sec buffer
  const compare = new Date(new Date().getTime() + 5000);
  if (!auth.accessToken || compare > auth.expiration) {
    await auth.refreshAuthentication();
  }
}

export default {};
