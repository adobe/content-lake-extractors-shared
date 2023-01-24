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
/* eslint-disable no-unused-expressions */

import assert from 'assert';
import { OauthAuthenticator } from '../src/auth.js';
import { wait } from './util.js';

describe('Auth Test', function () {
  this.timeout(10000);

  let refreshCount;
  let refreshToken;
  /**
   * @type {OauthAuthenticator}
   */
  let mockAuthenticator;

  beforeEach(() => {
    refreshCount = 0;
    mockAuthenticator = new OauthAuthenticator({
      refreshTokenUpdateListener: (newToken) => {
        refreshToken = newToken;
      },
      authenticationUrlGenerator: (redirect) => `http://localhost:8080/auth?redirect=${redirect}`,
      callbackHandler: (params) => {
        if (params.code === 'valid') {
          return {
            refreshToken: 'valid',
          };
        }
        throw new Error('Invalid auth code');
      },
      refreshAccessToken: (token) => {
        if (token === 'valid') {
          refreshCount += 1;
          return { accessToken: 'valid', expiration: new Date() };
        }
        throw new Error('Invalid refresh token');
      },
    });
  });

  it('can check authentication', async () => {
    assert(mockAuthenticator.requiresReauthentication());
    mockAuthenticator.refreshToken = 'valid';
    assert(!mockAuthenticator.requiresReauthentication());
  });

  it('ensure requires authentication', async () => {
    assert(mockAuthenticator.requiresReauthentication());
    let err;
    try {
      await mockAuthenticator.ensureAuthenticated();
    } catch (caught) {
      err = caught;
    }
    assert.ok(err);
  });

  it('can perform auth', async () => {
    assert.ok(mockAuthenticator.requiresReauthentication());

    const authUrl = await mockAuthenticator.getAuthenticationUrl('test');
    assert.strictEqual(authUrl, 'http://localhost:8080/auth?redirect=test');

    await mockAuthenticator.handleCallback({ code: 'valid' });
    assert.strictEqual(mockAuthenticator.requiresReauthentication(), false);
    assert.strictEqual(refreshToken, 'valid');

    await mockAuthenticator.ensureAuthenticated();
    assert.strictEqual(refreshCount, 1);
    await wait(100);
    await mockAuthenticator.ensureAuthenticated();
    assert.strictEqual(refreshCount, 2);
  });
});
