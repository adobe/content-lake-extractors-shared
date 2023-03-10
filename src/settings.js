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
  DeleteItemCommand,
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  QueryCommand,
} from '@aws-sdk/client-dynamodb';

/**
 * @typedef {Objects} SettingsObject
 * @property {string} sourceId
 * @property {string} spaceId
 * @property {string} sourceType
 */

/**
 * @typedef {Object} QueryOptions
 * @property {string | undefined} spaceId
 * @property {string | undefined} sourceType
 * @property {any} cursor
 * @property {number | undefined} limit
 */

/**
 * @typedef {Object} QueryResult
 * @property {Array<SettingsObject>} items
 * @property {number} count
 * @property {any} cursor
 */

export class SettingsStore {
  #client;

  #table;

  /**
   * Creates a Settings Store
   * @param {Object | undefined} config the configuration
   */
  constructor(config) {
    this.#client = new DynamoDBClient({ region: 'us-east-1', ...config });
    this.#table = config.tableName || 'adobe-content-lake-extractors';
  }

  /**
   * Deserializes an item
   * @param {Record<string,AttributeValue> | undefined} item
   * @returns {SettingsObject}
   */
  static deserializeItem(item) {
    if (item) {
      const newItem = {};
      Object.keys(item).forEach((k) => {
        newItem[k] = item[k].S;
      });
      return newItem;
    }
    return undefined;
  }

  /**
   * Deletes the settings
   * @param {string} sourceId the sourceId
   */
  async deleteSettings(sourceId) {
    await this.#client.send(
      new DeleteItemCommand({
        TableName: this.#table,
        Key: {
          sourceId: {
            S: sourceId,
          },
        },
      }),
    );
  }

  /**
   * Gets the specified settings
   * @param {string} sourceId the sourceId of the extractor settings to retrieve
   * @returns {Promise<SettingsObject>} the settings
   */
  async getSettings(sourceId) {
    const res = await this.#client.send(
      new GetItemCommand({
        TableName: this.#table,
        Key: {
          sourceId: {
            S: sourceId,
          },
        },
      }),
    );
    return SettingsStore.deserializeItem(res.Item);
  }

  /**
   *
   * @param {QueryOptions} options
   * @returns {Promise<QueryResult>}
   */
  async findSettings(options) {
    const cmdInput = {
      TableName: this.#table,
    };

    let field = 'sourceId';
    if (options.sourceType) {
      field = 'sourceType';
      cmdInput.IndexName = 'sourceType-index';
      cmdInput.KeyConditionExpression = `${field}=:sourceType`;
      cmdInput.ExpressionAttributeValues = {
        ':sourceType': { S: options.sourceType },
      };
    } else if (options.spaceId) {
      field = 'spaceId';
      cmdInput.IndexName = 'spaceId-index';
      cmdInput.KeyConditionExpression = `${field}=:spaceId`;
      cmdInput.ExpressionAttributeValues = {
        ':spaceId': { S: options.spaceId },
      };
    } else {
      const err = new Error('Either [sourceType] or [spaceId] are required');
      err.status = 400;
      throw err;
    }

    if (options.cursor) {
      cmdInput.ExclusiveStartKey = options.cursor;
    }
    if (options.limit) {
      cmdInput.Limit = options.limit;
    }

    const res = await this.#client.send(new QueryCommand(cmdInput));
    return {
      items: res.Items.map(SettingsStore.deserializeItem),
      count: res.Count,
      cursor: res.LastEvaluatedKey,
    };
  }

  /**
   * Puts or creates the specified settings
   * @param {SettingsObject} settings the settings to persist
   */
  async putSettings(settings) {
    const Item = {};
    Object.keys(settings).forEach((k) => {
      Item[k] = {
        S: settings[k],
      };
    });
    const command = new PutItemCommand({
      TableName: this.#table,
      Item,
    });
    await this.#client.send(command);
  }
}
