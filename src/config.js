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

import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';

const BUCKET_NAME = 'content-lake-extractors-configuration';

export class ConfigurationManager {
  #client;

  /**
   * Creates a Configuration Manager
   * @param {Object} config the configuration
   */
  constructor(config) {
    this.#client = new S3Client({ region: 'us-east-1', ...config });
  }

  /**
   * Gets the specified configuration
   * @param {string} id the id of the extractor configuration to retrieve
   */
  async getConfiguration(id) {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: id,
    });
    try {
      const res = await this.#client.send(command);
      return JSON.parse(Buffer.concat(await res.Body.toArray()).toString());
    } catch (err) {
      if (err.name === 'NoSuchKey') {
        return undefined;
      } else {
        throw err;
      }
    }
  }

  /**
   * Puts or creates the specified configuration
   * @param {string} id the id of the extractor configuration to persist
   * @param {Object} configuration the configuration to persist
   */
  async putConfiguration(id, configuration) {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: id,
      Body: JSON.stringify(configuration),
    });
    const res = await this.#client.send(command);
    console.log(res);
  }
}
