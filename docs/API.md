## Classes

<dl>
<dt><a href="#IngestorClient">IngestorClient</a></dt>
<dd><p>The ingestor client sends asset data to the Content Lake ingestion service to be ingested</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#extractCredentials">extractCredentials(env)</a> ⇒</dt>
<dd><p>Loads the configuration keys from an environment variable map</p>
</dd>
<dt><a href="#IngestorClient.">IngestorClient.(data, keys, toMerge)</a></dt>
<dd><p>Filters the data to the specified keys and then merges with the toMerge object.</p>
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
<dt><a href="#InvocationResponse">InvocationResponse</a></dt>
<dd></dd>
<dt><a href="#IngestionRequest">IngestionRequest</a> : <code>Object</code></dt>
<dd></dd>
<dt><a href="#IngestionResponse">IngestionResponse</a> : <code>Object</code></dt>
<dd></dd>
<dt><a href="#SourceData">SourceData</a> : <code>Object</code></dt>
<dd><p>The data extracted from the source</p>
</dd>
<dt><a href="#BinaryRequest">BinaryRequest</a> : <code>Object</code></dt>
<dd><p>A description of a HTTP request to make to retrieve a binary</p>
</dd>
<dt><a href="#IngestorConfig">IngestorConfig</a></dt>
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
<dt><a href="#TraverserResult">TraverserResult</a></dt>
<dd></dd>
<dt><a href="#TraverserConfig">TraverserConfig</a></dt>
<dd></dd>
</dl>

<a name="extractCredentials"></a>

## extractCredentials(env) ⇒
Loads the configuration keys from an environment variable map

**Kind**: global function  
**Returns**: the configuration to use  

| Param | Type | Description |
| --- | --- | --- |
| env | <code>Record.&lt;string, string&gt;</code> | the environment variables map |

<a name="IngestorClient."></a>

## IngestorClient.(data, keys, toMerge)
Filters the data to the specified keys and then merges with the toMerge object.

**Kind**: global function  

| Param | Type |
| --- | --- |
| data | <code>Record.&lt;string, any&gt;</code> | 
| keys | <code>Array.&lt;string&gt;</code> | 
| toMerge | <code>Record.&lt;string, any&gt;</code> | 

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

<a name="InvocationResponse"></a>

## InvocationResponse
**Kind**: global typedef  
**Properties**

| Name | Type |
| --- | --- |
| status | <code>number</code> | 
| data | <code>Object</code> \| <code>undefined</code> | 

<a name="IngestionRequest"></a>

## IngestionRequest : <code>Object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| data | [<code>SourceData</code>](#SourceData) | the data extracted from the source |
| binary | [<code>BinaryRequest</code>](#BinaryRequest) | a description of the request to retrieve the binary for the asset |
| batchId | <code>string</code> \| <code>undefined</code> | an identifier for the current batch |

<a name="IngestionResponse"></a>

## IngestionResponse : <code>Object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| accepted | <code>boolean</code> | true if the asset was accepted by the ingestion service |
| [reason] | <code>any</code> | the reason the asset was not accepted |

<a name="SourceData"></a>

## SourceData : <code>Object</code>
The data extracted from the source

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
A description of a HTTP request to make to retrieve a binary

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| url | <code>string</code> | the url to connect to in order to retrieve the binary |
| [headers] | <code>Record.&lt;string, string&gt;</code> \| <code>undefined</code> | headers to send with the request to retrieve the binary |

<a name="IngestorConfig"></a>

## IngestorConfig
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| apiKey | <code>string</code> | the API Key used to call the ingestor |
| companyId | <code>string</code> | the id of the company for which this should be ingested |
| jobId | <code>string</code> | the id of the current job |
| [log] | <code>any</code> | the logger |
| spaceId | <code>string</code> | the id of the space into which this should be ingested |
| url | <code>string</code> | the URL for calling the ingestor |

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

<a name="TraverserResult"></a>

## TraverserResult
**Kind**: global typedef  
**Properties**

| Name | Type |
| --- | --- |
| duration | <code>number</code> | 
| errors | <code>Array.&lt;{method: string, node: any, error: Error}&gt;</code> | 
| processed | <code>number</code> | 
| traversed | <code>number</code> | 

<a name="TraverserConfig"></a>

## TraverserConfig
**Kind**: global typedef  
**Properties**

| Name | Type |
| --- | --- |
| [formatForLog] | <code>function</code> | 
| getChildrenFn | <code>function</code> | 
| hasChildrenFn | <code>function</code> | 
| log | <code>any</code> | 
| [processBatchSize] | <code>number</code> | 
| processFn | <code>function</code> | 
| shouldProcessFn | <code>function</code> | 
| [traversalBatchSize] | <code>number</code> | 
| [waitDuration] | <code>number</code> | 

