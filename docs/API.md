## Classes

<dl>
<dt><a href="#BatchExecutor">BatchExecutor</a></dt>
<dd><p>This class supports processing items in batches while limiting concurrency to avoid
denial requests from downstream systems supporting both cursor-based and tree-based
traversals as well as direct batch processing.</p>
<p>It utilizes two queues to control the processing. The traversal queue manages the
items which should be checked for additional derived batches or if they should be processed.
The processing queue manages the items which should be processed.</p>
<p>This library uses async&#39;s eachLimit to execute the functions asynchronously while
limiting concurrency.</p>
</dd>
<dt><a href="#BaseBatchProvider">BaseBatchProvider</a></dt>
<dd><p>A BatchProvider provides batches and items to process to the BatchExecutor. This implementation
will do nothing.
Implementations should implement this class, implementing the required methods for the use case.</p>
</dd>
<dt><a href="#IngestorClient">IngestorClient</a></dt>
<dd><p>The ingestor client sends asset data to the Content Lake ingestion service to be ingested</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#IngestorClient.">IngestorClient.(data, keys, toMerge)</a></dt>
<dd><p>Filters the data to the specified keys and then merges with the toMerge object.</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#OauthCredentials">OauthCredentials</a></dt>
<dd></dd>
<dt><a href="#OauthConfig">OauthConfig</a> : <code>Object</code></dt>
<dd></dd>
<dt><a href="#BatchResult">BatchResult</a></dt>
<dd></dd>
<dt><a href="#ErrorItem">ErrorItem</a></dt>
<dd></dd>
<dt><a href="#BatchConfig">BatchConfig</a></dt>
<dd></dd>
<dt><a href="#ExecutionState">ExecutionState</a></dt>
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
<dt><a href="#SettingsObject">SettingsObject</a> : <code>Objects</code></dt>
<dd></dd>
<dt><a href="#QueryOptions">QueryOptions</a> : <code>Object</code></dt>
<dd></dd>
<dt><a href="#QueryResult">QueryResult</a> : <code>Object</code></dt>
<dd></dd>
</dl>

<a name="BaseBatchProvider"></a>

## BaseBatchProvider
A BatchProvider provides batches and items to process to the BatchExecutor. This implementation
will do nothing.
Implementations should implement this class, implementing the required methods for the use case.

**Kind**: global class  

* [BaseBatchProvider](#BaseBatchProvider)
    * [.formatForLog(item)](#BaseBatchProvider+formatForLog) ⇒ <code>any</code>
    * [.getBatch(item)](#BaseBatchProvider+getBatch) ⇒ <code>Promise.&lt;any&gt;</code>
    * [.hasMore(item)](#BaseBatchProvider+hasMore) ⇒ <code>Promise.&lt;boolean&gt;</code>
    * [.process(item)](#BaseBatchProvider+process) ⇒ <code>Promise.&lt;void&gt;</code>
    * [.shouldProcess(item)](#BaseBatchProvider+shouldProcess) ⇒ <code>Promise.&lt;boolean&gt;</code>

<a name="BaseBatchProvider+formatForLog"></a>

### baseBatchProvider.formatForLog(item) ⇒ <code>any</code>
Formats the item for logging

**Kind**: instance method of [<code>BaseBatchProvider</code>](#BaseBatchProvider)  
**Returns**: <code>any</code> - the formatted item to log  

| Param | Type | Description |
| --- | --- | --- |
| item | <code>any</code> | the item to format |

<a name="BaseBatchProvider+getBatch"></a>

### baseBatchProvider.getBatch(item) ⇒ <code>Promise.&lt;any&gt;</code>
Returns the next batch of items

**Kind**: instance method of [<code>BaseBatchProvider</code>](#BaseBatchProvider)  

| Param | Type | Description |
| --- | --- | --- |
| item | <code>any</code> | the item from which to get the next batch |

<a name="BaseBatchProvider+hasMore"></a>

### baseBatchProvider.hasMore(item) ⇒ <code>Promise.&lt;boolean&gt;</code>
Checks whether or not there are more items which can be retrieved from the current item

**Kind**: instance method of [<code>BaseBatchProvider</code>](#BaseBatchProvider)  

| Param | Type | Description |
| --- | --- | --- |
| item | <code>any</code> | the item to check if there are more items |

<a name="BaseBatchProvider+process"></a>

### baseBatchProvider.process(item) ⇒ <code>Promise.&lt;void&gt;</code>
Processes the specified item. This is a terminal operation for the item.
Examples could include sending the item to the ingestion service or logging the
item for a report.

**Kind**: instance method of [<code>BaseBatchProvider</code>](#BaseBatchProvider)  

| Param | Type | Description |
| --- | --- | --- |
| item | <code>any</code> | the item to process |

<a name="BaseBatchProvider+shouldProcess"></a>

### baseBatchProvider.shouldProcess(item) ⇒ <code>Promise.&lt;boolean&gt;</code>
Checks if the item should be processed.

**Kind**: instance method of [<code>BaseBatchProvider</code>](#BaseBatchProvider)  
**Returns**: <code>Promise.&lt;boolean&gt;</code> - true if the item should be processed  

| Param | Type | Description |
| --- | --- | --- |
| item | <code>any</code> | the item to evaluate if it should be processed |

<a name="IngestorClient."></a>

## IngestorClient.(data, keys, toMerge)
Filters the data to the specified keys and then merges with the toMerge object.

**Kind**: global function  

| Param | Type |
| --- | --- |
| data | <code>Record.&lt;string, any&gt;</code> | 
| keys | <code>Array.&lt;string&gt;</code> | 
| toMerge | <code>Record.&lt;string, any&gt;</code> | 

<a name="OauthCredentials"></a>

## OauthCredentials
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| accessToken | <code>string</code> \| <code>undefined</code> | The current access token or undefined if no token is available |
| expiration | <code>Date</code> \| <code>undefined</code> | The date at which the access token will expire |
| refreshToken | <code>string</code> \| <code>undefined</code> | The current, long lived refresh token or undefined if no token is available |

<a name="OauthConfig"></a>

## OauthConfig : <code>Object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| redirectUri | <code>string</code> | the URI to which to redirect the user after      they authenticate with the OAuth server |
| sourceId | <code>string</code> | the identifer for the current source |
| [refreshToken] | <code>string</code> | the refresh token to use if one is already available |

<a name="BatchResult"></a>

## BatchResult
**Kind**: global typedef  
**Properties**

| Name | Type |
| --- | --- |
| duration | <code>number</code> | 
| errors | [<code>Array.&lt;ErrorItem&gt;</code>](#ErrorItem) | 
| processed | <code>number</code> | 
| [traversed] | <code>number</code> | 

<a name="ErrorItem"></a>

## ErrorItem
**Kind**: global typedef  
**Properties**

| Name | Type |
| --- | --- |
| method | <code>string</code> | 
| node | <code>any</code> | 
| error | <code>Error</code> \| <code>Object</code> | 

<a name="BatchConfig"></a>

## BatchConfig
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| log | <code>any</code> |  |
| [processLimit] | <code>number</code> | the concurrency limit for process executions |
| [traversalLimit] | <code>number</code> | the concurrency limit for traversal executions |
| [waitDuration] | <code>number</code> | the duration to wait if the processing queue is empty |

<a name="ExecutionState"></a>

## ExecutionState
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [errors] | [<code>Array.&lt;ErrorItem&gt;</code>](#ErrorItem) | errors during processing and traversing |
| [processed] | <code>number</code> | the number of items already processed |
| [processingBatch] | <code>Array.&lt;any&gt;</code> | the items which are currently being processed |
| [processingQueue] | <code>Array.&lt;any&gt;</code> | the queue of items to process |
| [traversed] | <code>number</code> | the items already traversed |
| [traversalBatch] | <code>Array.&lt;any&gt;</code> | the items currently being traversed |
| [traversalQueue] | <code>Array.&lt;any&gt;</code> | the items which are queued to be traversed |

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

