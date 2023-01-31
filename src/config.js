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
  ListObjectsCommand,
} from '@aws-sdk/client-s3';

const BUCKET_NAME = 'content-lake-extractors-configuration';

export class ConfigurationManager {
  #client;

  #extractor;

  /**
   * Creates a Configuration Manager
   * @param {string} extractor the name of the extractor
   * @param {Object | undefined} config the configuration
   */
  constructor(extractor, config) {
    this.#client = new S3Client({ region: 'us-east-1', ...config });
    this.#extractor = extractor;
  }

  /**
   * Gets the specified configuration
   * @param {string} id the id of the extractor configuration to retrieve
   */
  async getConfiguration(id) {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: `${this.#extractor}/${id}`,
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
   * Lists the configurations for the extractor
   * @returns {Promise<string[]>} a promise with the array of keys
   */
  async listConfigurations() {
    const configurations = [];
    let truncated = true;
    const params = {
      Bucket: BUCKET_NAME,
      Prefix: `${this.#extractor}/`,
    };
    while (truncated) {
      // eslint-disable-next-line no-await-in-loop
      const response = await this.#client.send(new ListObjectsCommand(params));
      response.Contents.forEach((item) => {
        configurations.push(item.Key);
      });
      truncated = response.IsTruncated;
      if (truncated) {
        params.Marker = response.Contents.slice(-1)[0].Key;
      }
    }
    return configurations;
  }

  /**
   * Puts or creates the specified configuration
   * @param {string} id the id of the extractor configuration to persist
   * @param {Object} configuration the configuration to persist
   */
  async putConfiguration(id, configuration) {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: `${this.#extractor}/${id}`,
      Body: JSON.stringify(configuration),
    });
    await this.#client.send(command);
  }
}
