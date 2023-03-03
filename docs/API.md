## Classes

<dl>
<dt><a href="#IngestorClient">IngestorClient</a></dt>
<dd><p>The ingestor client sends asset data to the Content Lake ingestion service to be ingested</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#performOauthAuthentication">performOauthAuthentication(oauthAuthenticator, port)</a></dt>
<dd><p>Performs an authentication with th</p>
</dd>
<dt><a href="#cli">cli(config)</a></dt>
<dd><p>Parse the arguments from the current process and execute the extractor function</p>
</dd>
<dt><a href="#extractCredentials">extractCredentials(env)</a> ⇒</dt>
<dd><p>Loads the configuration keys from an environment variable map</p>
</dd>
<dt><a href="#sendProblem">sendProblem(problem)</a> ⇒ <code>Response</code></dt>
<dd><p>Creates an application/problem+json response</p>
</dd>
<dt><a href="#handleErrorAsProblem">handleErrorAsProblem(err, instance)</a> ⇒</dt>
<dd><p>Attempts to send a reasonable problem response</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#RefreshListenerFn">RefreshListenerFn</a> ⇒ <code>Promise.&lt;void&gt;</code></dt>
<dd><p>Listener for updates to the refresh token.</p>
</dd>
<dt><a href="#AuthenticationUrlGeneratorFn">AuthenticationUrlGeneratorFn</a> ⇒ <code>Promise.&lt;string&gt;</code></dt>
<dd><p>Get a url for authenticating with the Oauth service</p>
</dd>
<dt><a href="#CallbackHandlerFn">CallbackHandlerFn</a> ⇒ <code><a href="#OauthCredentials">Promise.&lt;OauthCredentials&gt;</a></code></dt>
<dd><p>Handles the callback redirect from an OAuth request</p>
</dd>
<dt><a href="#RefreshAccessTokenFn">RefreshAccessTokenFn</a> ⇒ <code><a href="#OauthCredentials">Promise.&lt;OauthCredentials&gt;</a></code></dt>
<dd><p>Refreshes the access token using the refresh token</p>
</dd>
<dt><a href="#OauthCredentials">OauthCredentials</a></dt>
<dd></dd>
<dt><a href="#GetExtractorFn">GetExtractorFn</a> ⇒ <code>Promise.&lt;extract.Extractor&gt;</code></dt>
<dd><p>a function to get the extractor from the configuration</p>
</dd>
<dt><a href="#GetOauthAuthenicatorFn">GetOauthAuthenicatorFn</a> ⇒ <code>Promise.&lt;(auth.OauthAuthenticator|undefined)&gt;</code></dt>
<dd><p>the authenticator if oauth authentication is requred</p>
</dd>
<dt><a href="#CliConfig">CliConfig</a></dt>
<dd></dd>
<dt><a href="#IngestionRequest">IngestionRequest</a> : <code>Object</code></dt>
<dd><p>A representation of an asset from the source</p>
</dd>
<dt><a href="#AssetData">AssetData</a> : <code>Object</code></dt>
<dd><p>A representation of an asset from the source</p>
</dd>
<dt><a href="#BinaryRequest">BinaryRequest</a> : <code>Object</code></dt>
<dd><p>A description of the request to make to retrieve an asset binary</p>
</dd>
<dt><a href="#HttpBinaryRequest">HttpBinaryRequest</a> : <code><a href="#BinaryRequest">BinaryRequest</a></code></dt>
<dd><p>A description of a HTTP request to make to retrieve an asset binary</p>
</dd>
<dt><a href="#Folder">Folder</a> : <code>Object</code></dt>
<dd><p>A representation of a folder in the source system</p>
</dd>
<dt><a href="#AssetBatch">AssetBatch</a> : <code>Object</code></dt>
<dd></dd>
<dt><a href="#GetAssetsConfig">GetAssetsConfig</a> : <code>Object</code></dt>
<dd></dd>
<dt><a href="#GetAssetsFn">GetAssetsFn</a> ⇒ <code><a href="#AssetBatch">Promise.&lt;AssetBatch&gt;</a></code></dt>
<dd><p>Retrieves a batch of assets from the source</p>
</dd>
<dt><a href="#GetBinaryRequestFn">GetBinaryRequestFn</a> ⇒ <code><a href="#BinaryRequest">Promise.&lt;BinaryRequest&gt;</a></code></dt>
<dd><p>Gets the request descriptor to retrieve the asset</p>
</dd>
<dt><a href="#GetFoldersFn">GetFoldersFn</a> ⇒ <code>Promise.&lt;Array.&lt;Folder&gt;&gt;</code></dt>
<dd><p>Gets the folders which are children of the specified parent</p>
</dd>
<dt><a href="#Extractor">Extractor</a></dt>
<dd></dd>
<dt><a href="#AssetCallback">AssetCallback</a> ⇒ <code>Promise.&lt;void&gt;</code></dt>
<dd></dd>
<dt><a href="#InvocationResponse">InvocationResponse</a></dt>
<dd></dd>
<dt><a href="#IngestorConfig">IngestorConfig</a></dt>
<dd></dd>
<dt><a href="#SubmitBatchOptions">SubmitBatchOptions</a></dt>
<dd></dd>
<dt><a href="#Problem">Problem</a></dt>
<dd></dd>
<dt><a href="#Handler">Handler</a> ⇒ <code>Promise.&lt;Response&gt;</code></dt>
<dd><p>Function for handling a routes inside Frankin / Content Lake services</p>
</dd>
<dt><a href="#SettingsObject">SettingsObject</a> : <code>Objects</code></dt>
<dd></dd>
<dt><a href="#QueryOptions">QueryOptions</a> : <code>Object</code></dt>
<dd></dd>
<dt><a href="#QueryResult">QueryResult</a> : <code>Object</code></dt>
<dd></dd>
</dl>

<a name="performOauthAuthentication"></a>

## performOauthAuthentication(oauthAuthenticator, port)
Performs an authentication with th

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| oauthAuthenticator | <code>auth.OauthAuthenticator</code> | the authenticator with which to perform the authentication |
| port | <code>number</code> | the port number to use when setting up the server on localhost |

<a name="cli"></a>

## cli(config)
Parse the arguments from the current process and execute the extractor function

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| config | [<code>CliConfig</code>](#CliConfig) | the configuration |

<a name="extractCredentials"></a>

## extractCredentials(env) ⇒
Loads the configuration keys from an environment variable map

**Kind**: global function  
**Returns**: the configuration to use  

| Param | Type | Description |
| --- | --- | --- |
| env | <code>Record.&lt;string, string&gt;</code> | the environment variables map |

<a name="sendProblem"></a>

## sendProblem(problem) ⇒ <code>Response</code>
Creates an application/problem+json response

**Kind**: global function  
**Returns**: <code>Response</code> - the problem response  

| Param | Type | Description |
| --- | --- | --- |
| problem | [<code>Problem</code>](#Problem) | the problem json |

<a name="handleErrorAsProblem"></a>

## handleErrorAsProblem(err, instance) ⇒
Attempts to send a reasonable problem response

**Kind**: global function  
**Returns**: Response  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>\*</code> | the error to handle |
| instance | <code>string</code> | an identifier for this error instance  to enable tracking back in the logs |

<a name="RefreshListenerFn"></a>

## RefreshListenerFn ⇒ <code>Promise.&lt;void&gt;</code>
Listener for updates to the refresh token.

**Kind**: global typedef  

| Param | Type | Description |
| --- | --- | --- |
| refreshToken | <code>String</code> | the refresh token to use |

<a name="AuthenticationUrlGeneratorFn"></a>

## AuthenticationUrlGeneratorFn ⇒ <code>Promise.&lt;string&gt;</code>
Get a url for authenticating with the Oauth service

**Kind**: global typedef  
**Returns**: <code>Promise.&lt;string&gt;</code> - a promise resolving to the URL  

| Param | Type | Description |
| --- | --- | --- |
| redirectUri | <code>String</code> | the uri to redirect to when done |

<a name="CallbackHandlerFn"></a>

## CallbackHandlerFn ⇒ [<code>Promise.&lt;OauthCredentials&gt;</code>](#OauthCredentials)
Handles the callback redirect from an OAuth request

**Kind**: global typedef  
**Returns**: [<code>Promise.&lt;OauthCredentials&gt;</code>](#OauthCredentials) - the credentials from authenticating  

| Param | Type | Description |
| --- | --- | --- |
| queryParams | <code>Record.&lt;string, string&gt;</code> | the params parsed from the request |

<a name="RefreshAccessTokenFn"></a>

## RefreshAccessTokenFn ⇒ [<code>Promise.&lt;OauthCredentials&gt;</code>](#OauthCredentials)
Refreshes the access token using the refresh token

**Kind**: global typedef  
**Returns**: [<code>Promise.&lt;OauthCredentials&gt;</code>](#OauthCredentials) - the credentials from authenticating  

| Param | Type | Description |
| --- | --- | --- |
| refreshToken | <code>string</code> | the refresh token |

<a name="OauthCredentials"></a>

## OauthCredentials
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| accessToken | <code>string</code> \| <code>undefined</code> | The current access token or undefined if no token is available |
| expiration | <code>Date</code> \| <code>undefined</code> | The date at which the access token will expire |
| refreshToken | <code>string</code> \| <code>undefined</code> | The current, long lived refresh token or undefined if no token is available |

<a name="GetExtractorFn"></a>

## GetExtractorFn ⇒ <code>Promise.&lt;extract.Extractor&gt;</code>
a function to get the extractor from the configuration

**Kind**: global typedef  

| Param | Type |
| --- | --- |
| config | <code>any</code> | 

<a name="GetOauthAuthenicatorFn"></a>

## GetOauthAuthenicatorFn ⇒ <code>Promise.&lt;(auth.OauthAuthenticator\|undefined)&gt;</code>
the authenticator if oauth authentication is requred

**Kind**: global typedef  

| Param | Type |
| --- | --- |
| config | <code>any</code> | 

<a name="CliConfig"></a>

## CliConfig
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| args | <code>Array.&lt;string&gt;</code> | the arguments from the command line |
| name | <code>string</code> | the name of the extractor |
| getExtractor | [<code>GetExtractorFn</code>](#GetExtractorFn) | a function to get the extractor from the configuration |
| getOauthAuthenicator | [<code>GetOauthAuthenicatorFn</code>](#GetOauthAuthenicatorFn) | the authenticator if oauth authentication is requred |

<a name="IngestionRequest"></a>

## IngestionRequest : <code>Object</code>
A representation of an asset from the source

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| data | [<code>AssetData</code>](#AssetData) | the data for the asset |
| binary | [<code>BinaryRequest</code>](#BinaryRequest) | a description of the request to retrieve the binary for the asset |
| jobId | <code>string</code> | a unique identifer for a request to ingest an asset |

<a name="AssetData"></a>

## AssetData : <code>Object</code>
A representation of an asset from the source

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| sourceAssetId | <code>string</code> | the ID of this asset as interpreted by the source system |
| sourceType | <code>string</code> | the source from which this asset was retrieved |
| sourceId | <code>string</code> | the source from which this asset was retrieved |
| name | <code>string</code> \| <code>undefined</code> | the name of the asset as interpreted by the source repository |
| size | <code>number</code> \| <code>undefined</code> | the size of the original asset in bytes |
| created | <code>Date</code> \| <code>undefined</code> | the time at which the asset was created in the source |
| createdBy | <code>string</code> \| <code>undefined</code> | an identifier for the principal which created the asset |
| lastModified | <code>Date</code> \| <code>undefined</code> | the last time the asset was modified |
| lastModifiedBy | <code>string</code> \| <code>undefined</code> | an identifier for the principal which last modified the asset |
| path | <code>string</code> \| <code>undefined</code> | the path to the asset |
| [binary] | [<code>BinaryRequest</code>](#BinaryRequest) \| <code>undefined</code> | If provided, information about the request  that can be sent to retrieve the asset's binary data. If missing, the ingestion process will  make a second call to the extractor to retrieve this information. |

<a name="BinaryRequest"></a>

## BinaryRequest : <code>Object</code>
A description of the request to make to retrieve an asset binary

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| requestType | <code>string</code> | the type of the request to make to retrieve the binary |

<a name="HttpBinaryRequest"></a>

## HttpBinaryRequest : [<code>BinaryRequest</code>](#BinaryRequest)
A description of a HTTP request to make to retrieve an asset binary

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| url | <code>string</code> | the url to connect to in order to retrieve the binary |
| headers | <code>Record.&lt;string, string&gt;</code> \| <code>undefined</code> | headers to send with the request to retrieve the binary |

<a name="Folder"></a>

## Folder : <code>Object</code>
A representation of a folder in the source system

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| id | <code>any</code> | the id of the folder |
| name | <code>string</code> | the user-visible name of the folder |

<a name="AssetBatch"></a>

## AssetBatch : <code>Object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| assets | [<code>Array.&lt;AssetData&gt;</code>](#AssetData) | the retrieved assets |
| more | <code>boolean</code> | if more assets are available |
| cursor | <code>any</code> | the cursor for retrieving the next batch of assets, should be treated as opaque |

<a name="GetAssetsConfig"></a>

## GetAssetsConfig : <code>Object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| cursor | <code>any</code> \| <code>undefined</code> | the cursor to start at |
| limit | <code>number</code> \| <code>undefined</code> | the limit for the number of assets to retrieve |

<a name="GetAssetsFn"></a>

## GetAssetsFn ⇒ [<code>Promise.&lt;AssetBatch&gt;</code>](#AssetBatch)
Retrieves a batch of assets from the source

**Kind**: global typedef  

| Param | Type |
| --- | --- |
| config | [<code>GetAssetsConfig</code>](#GetAssetsConfig) \| <code>undefined</code> | 

<a name="GetBinaryRequestFn"></a>

## GetBinaryRequestFn ⇒ [<code>Promise.&lt;BinaryRequest&gt;</code>](#BinaryRequest)
Gets the request descriptor to retrieve the asset

**Kind**: global typedef  

| Param | Type |
| --- | --- |
| assetId | <code>string</code> | 

<a name="GetFoldersFn"></a>

## GetFoldersFn ⇒ <code>Promise.&lt;Array.&lt;Folder&gt;&gt;</code>
Gets the folders which are children of the specified parent

**Kind**: global typedef  

| Param | Type |
| --- | --- |
| parentId | <code>string</code> \| <code>undefined</code> | 

<a name="Extractor"></a>

## Extractor
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| getAssets | [<code>GetAssetsFn</code>](#GetAssetsFn) | Retrieves a batch of assets from the source |
| getBinaryRequest | [<code>GetBinaryRequestFn</code>](#GetBinaryRequestFn) | Gets the request descriptor to retrieve the asset |
| getFolders | [<code>GetFoldersFn</code>](#GetFoldersFn) | Gets the folders which are children of the specified parent |

<a name="AssetCallback"></a>

## AssetCallback ⇒ <code>Promise.&lt;void&gt;</code>
**Kind**: global typedef  
**Returns**: <code>Promise.&lt;void&gt;</code> - a promise which resolves once the callback is finished  

| Param | Type | Description |
| --- | --- | --- |
| asset | <code>Asset</code> | the asset for which to invoke the callback |

<a name="InvocationResponse"></a>

## InvocationResponse
**Kind**: global typedef  
**Properties**

| Name | Type |
| --- | --- |
| status | <code>number</code> | 
| data | <code>Object</code> \| <code>undefined</code> | 

<a name="IngestorConfig"></a>

## IngestorConfig
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| url | <code>string</code> | the URL for calling the ingestor |
| apiKey | <code>string</code> | the API Key used to call the ingestor |
| companyId | <code>string</code> | the id of the company for which this asset should be ingested |
| jobId | <code>string</code> | the id of the current job |
| spaceId | <code>string</code> | the id of the space into which this asset should be ingested |

<a name="SubmitBatchOptions"></a>

## SubmitBatchOptions
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| binaryRequestLimit | <code>number</code> \| <code>undefined</code> | the limit to the number of parallel requests  to get the binary |
| ingestLimit | <code>number</code> \| <code>undefined</code> | the limit to the number of parallel requests  to ingest assets |

<a name="Problem"></a>

## Problem
**Kind**: global typedef  
**Properties**

| Name | Type |
| --- | --- |
| status | <code>number</code> | 
| title | <code>string</code> \| <code>undefined</code> | 
| detail | <code>any</code> | 
| instance | <code>string</code> \| <code>undefined</code> | 

<a name="Handler"></a>

## Handler ⇒ <code>Promise.&lt;Response&gt;</code>
Function for handling a routes inside Frankin / Content Lake services

**Kind**: global typedef  
**Returns**: <code>Promise.&lt;Response&gt;</code> - the response from the request  

| Param | Type | Description |
| --- | --- | --- |
| req | <code>Request</code> | the request |
| context | <code>UniversalContext</code> | the context of the request |
| params | <code>Record.&lt;string, string&gt;</code> | the parameters parsed from the request |

<a name="SettingsObject"></a>

## SettingsObject : <code>Objects</code>
**Kind**: global typedef  
**Properties**

| Name | Type |
| --- | --- |
| sourceId | <code>string</code> | 
| spaceId | <code>string</code> | 
| sourceType | <code>string</code> | 

<a name="QueryOptions"></a>

## QueryOptions : <code>Object</code>
**Kind**: global typedef  
**Properties**

| Name | Type |
| --- | --- |
| spaceId | <code>string</code> \| <code>undefined</code> | 
| sourceType | <code>string</code> \| <code>undefined</code> | 
| cursor | <code>any</code> | 
| limit | <code>number</code> \| <code>undefined</code> | 

<a name="QueryResult"></a>

## QueryResult : <code>Object</code>
**Kind**: global typedef  
**Properties**

| Name | Type |
| --- | --- |
| items | [<code>Array.&lt;SettingsObject&gt;</code>](#SettingsObject) | 
| count | <code>number</code> | 
| cursor | <code>any</code> | 

