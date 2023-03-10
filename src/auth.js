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
 * Listener for updates to the refresh token.
 * @callback  RefreshListenerFn
 * @param {String} refreshToken the refresh token to use
 * @returns {Promise<void>}
 */

/**
 * Get a url for authenticating with the Oauth service
 * @callback  AuthenticationUrlGeneratorFn
 * @param {String} redirectUri the uri to redirect to when done
 * @returns {Promise<string>} a promise resolving to the URL
 */

/**
 * Handles the callback redirect from an OAuth request
 * @callback  CallbackHandlerFn
 * @param {Record<string,string>} queryParams the params parsed from the request
 * @returns {Promise<OauthCredentials>} the credentials from authenticating
 */

/**
 * Refreshes the access token using the refresh token
 * @callback  RefreshAccessTokenFn
 * @param {string} refreshToken the refresh token
 * @returns {Promise<OauthCredentials>} the credentials from authenticating
 */

/**
 * @typedef OauthCredentials
 * @property {string | undefined} accessToken
 *  The current access token or undefined if no token is available
 * @property {Date | undefined} expiration
 *  The date at which the access token will expire
 * @property {string | undefined} refreshToken
 *  The current, long lived refresh token or undefined if no token is available
 */

export class OauthAuthenticator {
  /**
   * @type {AuthenticationUrlGeneratorFn}
   */
  #authenticationUrlGenerator;

  /**
   * @type {CallbackHandlerFn}
   */
  #callbackHandler;

  /**
   * @type {RefreshListenerFn}
   */
  #refreshTokenUpdateListener;

  /**
   * @type {RefreshAccessTokenFn}
   */
  #refreshAccessToken;

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
   * the long lived refresh token or undefined if not authenticated
   * @type {string | undefined}
   */
  refreshToken;

  /**
   * Create a new OauthAutheticator
   * @param {string | undefined} refreshToken
   */
  constructor(refreshToken) {
    this.refreshToken = refreshToken;
  }

  /**
   * Ensures that the request is authenticated.
   * If a new access token is required, will exchange the refesh token for a new access token.
   */
  async ensureAuthenticated() {
    const requiresReauth = this.requiresReauthentication();
    if (requiresReauth) {
      throw new Error('Reauthentication requred');
    }
    // add 5sec buffer
    const compare = new Date(new Date().getTime() + 5000);
    if (!this.accessToken || compare > this.expiration) {
      const credentials = await this.#refreshAccessToken(this.refreshToken);
      await this.updateTokens(credentials);
    }
  }

  /**
   * Gets the URL to direct the user to in order to authenticate with this connector
   * @param {string} redirectUri the URI to which to redirect once the authentication is complete
   * @returns {Promise<string>}
   *    a promise which resolves to the URL to which to take the user to authenticate
   */
  async getAuthenticationUrl(redirectUri) {
    return this.#authenticationUrlGenerator(redirectUri);
  }

  /**
   * Handles the oauth callback,
   *
   * @param {Record<string,string>} query the query parameters passed to the callback URL
   */
  async handleCallback(query) {
    const credentials = await this.#callbackHandler(query);
    await this.updateTokens(credentials);
  }

  /**
   * Returns true if the connector is not authenticated and must be reauthenticated to work
   * @returns true if the connector requires authentication, false otherwise
   */
  requiresReauthentication() {
    return typeof this.refreshToken === 'undefined';
  }

  /**
   * Updates the tokens stored in this authenticator
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
      if (this.#refreshTokenUpdateListener) {
        await this.#refreshTokenUpdateListener(this.refreshToken);
      }
    }
  }

  /**
   * Builder method for setting the authenticationUrlGenerator
   * @param {AuthenticationUrlGeneratorFn} authenticationUrlGenerator a function for generating
   *    an authenticated url
   * @returns {OauthAuthenticator} the OauthAuthenticator instance
   */
  withAuthenticationUrlGenerator(authenticationUrlGenerator) {
    this.#authenticationUrlGenerator = authenticationUrlGenerator;
    return this;
  }

  /**
   * Builder method for setting the callbackHandler
   * @param {AuthenticationUrlGeneratorFn} callbackHandler a function handing the callback
   * @returns {OauthAuthenticator} the OauthAuthenticator instance
   */
  withCallbackHandler(callbackHandler) {
    this.#callbackHandler = callbackHandler;
    return this;
  }

  /**
   * Builder method for setting the refreshTokenUpdateListener
   * @param {RefreshAccessTokenFn} refreshAccessToken a function to
   *    call when the refresh token changes
   * @returns {OauthAuthenticator} the OauthAuthenticator instance
   */
  withRefreshAccessToken(refreshAccessToken) {
    this.#refreshAccessToken = refreshAccessToken;
    return this;
  }

  /**
   * Builder method for setting the refreshTokenUpdateListener
   * @param {RefreshListenerFn} refreshTokenUpdateListener a function to
   *    call when the refresh token changes
   * @returns {OauthAuthenticator} the OauthAuthenticator instance
   */
  withRefreshTokenUpdateListener(refreshTokenUpdateListener) {
    this.#refreshTokenUpdateListener = refreshTokenUpdateListener;
    return this;
  }
}

export default {};
