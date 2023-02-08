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

import * as dotenv from 'dotenv';

import {
  DeleteSecretCommand,
  ListSecretsCommand,
  SecretsManagerClient,
} from '@aws-sdk/client-secrets-manager';
import { extractCredentials } from '../../src/context.js';

// this script cleans up secrets created during failed IT runs
dotenv.config();
const secretManager = new SecretsManagerClient({
  region: 'us-east-1',
  ...extractCredentials(process.env),
});
secretManager
  .send(
    new ListSecretsCommand({
      IncludePlannedDeletion: false,
      MaxResults: 100,
    }),
  )
  .then((res) => {
    Promise.all(
      res.SecretList.filter(
        (secret) => secret.Name.startsWith('test') || secret.Name.startsWith('it'),
      ).map((secret) => {
        console.log('Removing secret', secret);
        return secretManager.send(
          new DeleteSecretCommand({
            SecretId: secret.Name,
          }),
        );
      }),
    ).then(() => console.log('All test secrets removed'));
  });
