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
/* eslint-disable class-methods-use-this */

import assert from 'assert';

/**
 * @typedef OauthCredentials
 * @property {string | undefined} accessToken
 *  The current access token or undefined if no token is available
 * @property {Date | undefined} expiration
 *  The date at which the access token will expire
 * @property {string | undefined} refreshToken
 *  The current, long lived refresh token or undefined if no token is available
 */

/**
 * @typedef {Object} OauthConfig
 * @property {string} redirectUri the URI to which to redirect the user after
 *      they authenticate with the OAuth server
 * @property {string} sourceId the identifer for the current source
 * @property {string} [refreshToken] the refresh token to use if one is already available
 */

export class BaseOauthAuthenticator {
  /**
   * the current access token or undefined
   * @type {string | undefined}
   */
  accessToken;

  /**
   * the expiration date of the current access token or undefined
   * @type {Date | undefined}
   */
  expiration;

  /**
   * the URI to which to redirect the user after they authenticate with the OAuth server
   * @type {string}
   */
  redirectUri;

  /**
   * the long lived refresh token or undefined if not authenticated
   * @type {string | undefined}
   */
  refreshToken;

  /**
   * the ID of the current source
   * @type {string}
   */
  sourceId;

  /**
   * Create a new OauthAutheticator
   * @param {OauthConfig} config
   */
  constructor(config) {
    assert.ok(config, 'Configuration must be provided');
    this.refreshToken = config.refreshToken;
    assert.ok(config.redirectUri, 'Property redirectUri must be provided');
    this.redirectUri = config.redirectUri;
    assert.ok(config.redirectUri, 'Property sourceId must be provided');
    this.sourceId = config.sourceId;
  }

  /**
   * Ensures that the request is authenticated.
   * If a new access token is required, will exchange the refesh token for a new access token.
   * This method shouldn't need to be overridden by implementations.
   */
  async ensureAuthenticated() {
    const requiresReauth = this.requiresReauthentication();
    if (requiresReauth) {
      throw new Error('Reauthentication required');
    }
    // add 5sec buffer
    const compare = new Date(new Date().getTime() + 5000);
    if (!this.accessToken || compare > this.expiration) {
      await this.refreshAccessToken(this.refreshToken);
    }
  }

  /**
   * Gets an access token, ensuring it is authenticated and if required exchaning the
   * refresh token for a new access token.
   * This method shouldn't need to be overridden by implementations.
   * @returns {Promise<string>} the access token
   */
  async getAccessToken() {
    await this.ensureAuthenticated();
    return this.accessToken;
  }

  /**
   * Gets the URL to direct the user to in order to authenticate with this connector.
   * This method must be overridden by implementations.
   * @returns {Promise<string>}
   *    a promise which resolves to the URL to which to take the user to authenticate
   */
  async getAuthenticationUrl() {
    return Promise.resolve('AUTHENTICATION_URL');
  }

  /**
   * Handles the oauth callback and updates the stored tokens.
   * This method must be overridden by implementations.
   *
   * @param {Record<string,string>} query the query parameters passed to the callback URL
   */
  // eslint-disable-next-line no-unused-vars
  async handleCallback(_query) {
    return Promise.resolve();
  }

  /**
   * Refreshes the access token with the refreshToken
   * This method must be overridden by implementations.
   * @returns {Promise<void>}
   */
  async refreshAccessToken() {
    return Promise.resolve();
  }

  /**
   * Returns true if the connector is not authenticated and must be reauthenticated to work
   * This method shouldn't need to be overridden by implementations.
   * @returns true if the connector requires authentication, false otherwise
   */
  requiresReauthentication() {
    return typeof this.refreshToken === 'undefined';
  }

  /**
   * Updates the tokens stored in this authenticator
   * This method shouldn't need to be overridden by implementations.
   * @param {OauthCredentials} credentials the oauth response
   */
  async updateTokens(credentials) {
    this.accessToken = credentials.accessToken;
    this.expiration = credentials.expiration;
    if (
      credentials.refreshToken
      && this.refreshToken !== credentials.refreshToken
    ) {
      this.refreshToken = credentials.refreshToken;
    }
  }
}

export default {};
