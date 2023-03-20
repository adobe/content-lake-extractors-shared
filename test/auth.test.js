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
import { BaseOauthAuthenticator } from '../src/auth.js';
import { wait } from './util.js';

class MockOauthAuthenticator extends BaseOauthAuthenticator {
  refreshCount = 0;

  async getAuthenticationUrl() {
    return Promise.resolve(
      `http://localhost:8080/auth?redirect=${this.redirectUri}`,
    );
  }

  async refreshAccessToken() {
    if (this.refreshToken === 'valid') {
      this.refreshCount += 1;
      this.updateTokens({ accessToken: 'valid', expiration: new Date() });
      return Promise.resolve();
    } else {
      throw new Error('Invalid refresh token');
    }
  }

  // eslint-disable-next-line class-methods-use-this
  handleCallback(params) {
    if (params.code === 'valid') {
      this.updateTokens({
        accessToken: 'valid',
        refreshToken: 'valid',
        expiration: new Date(),
      });
      return Promise.resolve();
    } else {
      throw new Error('Invalid auth code');
    }
  }
}

describe('OAuth Authenticator Tests', () => {
  it('can check authentication', async () => {
    const authenticator = new MockOauthAuthenticator({
      redirectUri: 'http://findmy.media',
    });
    assert(authenticator.requiresReauthentication());
    authenticator.refreshToken = 'valid';
    assert(!authenticator.requiresReauthentication());
  });

  it('ensure requires authentication', async () => {
    const authenticator = new MockOauthAuthenticator({
      redirectUri: 'http://findmy.media',
    });
    assert(authenticator.requiresReauthentication());
    let err;
    try {
      await authenticator.ensureAuthenticated();
    } catch (caught) {
      err = caught;
    }
    assert.ok(err);
  });

  it('can perform auth', async () => {
    const authenticator = new MockOauthAuthenticator({
      redirectUri: 'http://findmy.media',
    });
    assert.ok(authenticator.requiresReauthentication());

    const authUrl = await authenticator.getAuthenticationUrl();
    assert.strictEqual(
      authUrl,
      'http://localhost:8080/auth?redirect=http://findmy.media',
    );

    await authenticator.handleCallback({ code: 'valid' });
    assert.strictEqual(authenticator.requiresReauthentication(), false);
    assert.strictEqual(authenticator.refreshToken, 'valid');

    await authenticator.ensureAuthenticated();
    assert.strictEqual(authenticator.refreshCount, 1);
    await wait(100);
    await authenticator.ensureAuthenticated();
    assert.strictEqual(authenticator.refreshCount, 2);
  });

  it('can get access token', async () => {
    const authenticator = new MockOauthAuthenticator({
      redirectUri: 'http://findmy.media',
      refreshToken: 'valid',
    });
    const accessToken = await authenticator.getAccessToken();
    assert.ok(accessToken);
  });

  it('has noop OOTB methods', async () => {
    const authenticator = new BaseOauthAuthenticator({
      redirectUri: 'http://findmy.media',
      refreshToken: 'valid',
    });
    const authUrl = await authenticator.getAuthenticationUrl();
    assert.ok(authUrl);

    await authenticator.handleCallback({});

    await authenticator.refreshAccessToken();
  });
});
