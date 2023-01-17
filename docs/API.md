## Functions

<dl>
<dt><a href="#performOauthAuthentication">performOauthAuthentication(oauthAuthenticator, port)</a></dt>
<dd><p>Performs an authentication with th</p>
</dd>
<dt><a href="#cli">cli(config)</a></dt>
<dd><p>Parse the arguments from the current process and execute the extractor function</p>
</dd>
<dt><a href="#main">main(name)</a> ⇒ <code>string</code></dt>
<dd><p>This is the main function</p>
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
<dt><a href="#OauthAuthenticatorConfig">OauthAuthenticatorConfig</a></dt>
<dd><p>Configuration for an OauthAuthenticator instance</p>
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
<dt><a href="#Asset">Asset</a> : <code>Object</code></dt>
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

<a name="main"></a>

## main(name) ⇒ <code>string</code>
This is the main function

**Kind**: global function  
**Returns**: <code>string</code> - a greeting  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | name of the person to greet |

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

<a name="OauthAuthenticatorConfig"></a>

## OauthAuthenticatorConfig
Configuration for an OauthAuthenticator instance

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| refreshTokenUpdateListener | [<code>RefreshListenerFn</code>](#RefreshListenerFn) \| <code>undefined</code> | Listener for updates to the refresh token. |
| authenticationUrlGenerator | [<code>AuthenticationUrlGeneratorFn</code>](#AuthenticationUrlGeneratorFn) | Get a url for authenticating with the Oauth service |
| callbackHandler | [<code>CallbackHandlerFn</code>](#CallbackHandlerFn) | Handles the callback redirect from an OAuth request |
| refreshAccessToken | [<code>RefreshAccessTokenFn</code>](#RefreshAccessTokenFn) | Refreshes the access token using the refresh token |

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
| asset | [<code>Asset</code>](#Asset) | the asset |
| binary | [<code>BinaryRequest</code>](#BinaryRequest) | a description of the request to retrieve the binary for the asset |
| transactionId | <code>string</code> | a unique identifer for a request to ingest an asset |

<a name="Asset"></a>

## Asset : <code>Object</code>
A representation of an asset from the source

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | the ID of this asset as interpreted by the source system |
| sourceType | <code>string</code> | the source from which this asset was retrieved |
| sourceId | <code>string</code> | the source from which this asset was retrieved |
| name | <code>string</code> \| <code>undefined</code> | the name of the asset as interpreted by the source repository |
| version | <code>string</code> \| <code>undefined</code> | the current version of this asset as interpreted by the source repository |
| size | <code>number</code> \| <code>undefined</code> | the size of the original asset in bytes |
| created | <code>Date</code> \| <code>undefined</code> | the time at which the asset was created in the source |
| createdBy | <code>string</code> \| <code>undefined</code> | an identifier for the principal which created the asset |
| lastModified | <code>Date</code> \| <code>undefined</code> | the last time the asset was modified |
| lastModifiedBy | <code>string</code> \| <code>undefined</code> | an identifier for the principal which last modified the asset |
| taxonomy | <code>Record.&lt;string, any&gt;</code> | the taxonomy under which the asset is organized |
| metadata | <code>Record.&lt;string, any&gt;</code> | the available metadata for the asset from the source |

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
| assets | [<code>Array.&lt;Asset&gt;</code>](#Asset) | the retrieved assets |
| more | <code>boolean</code> | if more assets are available |
| cursor | <code>any</code> | the cursor for retrieving the next batch of assets, should be treated as opaque |

<a name="GetAssetsFn"></a>

## GetAssetsFn ⇒ [<code>Promise.&lt;AssetBatch&gt;</code>](#AssetBatch)
Retrieves a batch of assets from the source

**Kind**: global typedef  

| Param | Type |
| --- | --- |
| cursor | <code>any</code> \| <code>undefined</code> | 

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
| asset | [<code>Asset</code>](#Asset) | the asset for which to invoke the callback |

