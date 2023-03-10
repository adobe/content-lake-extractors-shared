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
 * A representation of an asset from the source
 * @typedef {Object} IngestionRequest
 * @property {AssetData} data the data for the asset
 * @property {BinaryRequest} binary
 *  a description of the request to retrieve the binary for the asset
 * @property {string} jobId a unique identifer for a request to ingest an asset
 */

/**
 * @typedef {Object} AssetData A representation of an asset from the source
 * @property {string} sourceAssetId the ID of this asset as interpreted by the source system
 * @property {string} sourceType the source from which this asset was retrieved
 * @property {string} sourceId the source from which this asset was retrieved
 * @property {string | undefined} name the name of the asset as interpreted by the source repository
 * @property {number | undefined} size the size of the original asset in bytes
 * @property {Date | undefined} created the time at which the asset was created in the source
 * @property {string | undefined} createdBy an identifier for the principal which created the asset
 * @property {Date | undefined} lastModified the last time the asset was modified
 * @property {string | undefined} lastModifiedBy
 *  an identifier for the principal which last modified the asset
 * @property {string | undefined} path the path to the asset
 * @property {BinaryRequest | undefined} [binary] If provided, information about the request
 *  that can be sent to retrieve the asset's binary data. If missing, the ingestion process will
 *  make a second call to the extractor to retrieve this information.
 */

/**
 * @typedef {Object} BinaryRequest A description of the request to make to retrieve an asset binary
 * @property {string} requestType the type of the request to make to retrieve the binary
 */

/**
 * @typedef {BinaryRequest} HttpBinaryRequest
 *  A description of a HTTP request to make to retrieve an asset binary
 * @property {string} url the url to connect to in order to retrieve the binary
 * @property {Record<string,string> | undefined} headers
 *  headers to send with the request to retrieve the binary
 */

/**
 * @typedef {Object} Folder A representation of a folder in the source system
 * @property {any} id the id of the folder
 * @property {string} name the user-visible name of the folder
 */

/**
 * @typedef {Object} AssetBatch
 * @property {Array<AssetData>} assets the retrieved assets
 * @property {boolean} more if more assets are available
 * @property {any} cursor
 *  the cursor for retrieving the next batch of assets, should be treated as opaque
 */

/**
 * @typedef {Object} GetAssetsConfig
 * @property {any | undefined} cursor the cursor to start at
 * @property {number | undefined} limit the limit for the number of assets to retrieve
 */

/**
 * Retrieves a batch of assets from the source
 * @callback GetAssetsFn
 * @param {GetAssetsConfig | undefined} config
 * @returns {Promise<AssetBatch>}
 */

/**
 * Gets the request descriptor to retrieve the asset
 * @callback GetBinaryRequestFn
 * @param {string} assetId
 * @returns {Promise<BinaryRequest>}
 */

/**
 * Gets the folders which are children of the specified parent
 * @callback GetFoldersFn
 * @param {string | undefined} parentId
 * @returns {Promise<Array<Folder>>}
 */

/**
 * @typedef Extractor An integration helper to extract content from a source
 * @property {GetAssetsFn} getAssets
 *  Retrieves a batch of assets from the source
 * @property {GetBinaryRequestFn} getBinaryRequest
 *  Gets the request descriptor to retrieve the asset
 * @property {GetFoldersFn} getFolders
 *  Gets the folders which are children of the specified parent
 */

/**
 * @callback AssetCallback A callback for handing an asset
 * @param {Asset} asset the asset for which to invoke the callback
 * @returns {Promise<void>} a promise which resolves once the callback is finished
 */
