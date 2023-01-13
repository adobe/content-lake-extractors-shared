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

export class MockOauthAuthenticator {
  accessToken;
  expiration;
  refreshToken;
  refreshTokenUpdateListener;

  async getAuthenticationUrl(redirectUrl) {
    return redirectUrl + "?code=success";
  }

  async handleCallback(params) {
    if (params.code !== "success") {
      throw new Error("BAD CODE");
    }
    this.expiration = new Date(new Date().getTime() + 10000);
    this.refreshToken = "valid";
    this.accessToken = "valid";
  }

  async refreshAuthentication() {
    this.expiration = new Date(new Date().getTime() + 10000);
    this.accessToken = "valid";
  }

  async requiresReauthentication() {
    return this.refreshToken !== "valid";
  }
}
