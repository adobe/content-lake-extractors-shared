# Content Lake - Extractors Shared

Shared libraries for extractors

## Status
[![codecov](https://img.shields.io/codecov/c/github/adobe/content-lake-extractors-shared.svg)](https://codecov.io/gh/adobe/content-lake-extractors-shared)
[![CircleCI](https://img.shields.io/circleci/project/github/adobe/content-lake-extractors-shared.svg)](https://circleci.com/gh/adobe/content-lake-extractors-shared)
[![GitHub license](https://img.shields.io/github/license/adobe/content-lake-extractors-shared.svg)](https://github.com/adobe/content-lake-extractors-shared/blob/master/LICENSE.txt)
[![GitHub issues](https://img.shields.io/github/issues/adobe/content-lake-extractors-shared.svg)](https://github.com/adobe/content-lake-extractors-shared/issues)
[![LGTM Code Quality Grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/adobe/content-lake-extractors-shared.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/adobe/content-lake-extractors-shared)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

## Installation

```bash
$ npm install @adobe/content-lake-extractors-shared
```

## Usage

See the [API documentation](docs/API.md).

## Development

### Build

```bash
$ npm install
```

### Test

```bash
$ npm test
```

### Lint

```bash
$ npm run lint
```

### Run all

Optionally you can use Make to run all the local build commands:

```bash
$ make
```

Make is available on most *nix environments can be installed on Mac via [homebrew](https://formulae.brew.sh/formula/make)

## HTTP Service

The shared library provides an `HttpService` class, which will add an HTTP interface on top of an extractor.

To create a new HTTP service, provide the extractor to use in its constructor:

```
const httpService = new HttpService({ extractor: myExtractor });
```

Then use the service to generate responses based on an HTTP request and Helix context:

```
const response = await httpService.generateResponse(fetchRequest, helixContext);
```

The service assumes that the request is a fetch-like request object. The response will be a simple object containing the major pieces of an HTTP response:

```
{
  body: '{"hello": "world!"}',
  status: 200,
  headers: {
    'Content-Type': 'application/json'
  }
}
```

### Service Endpoints

The service provides the following endpoints:

| Endpoint | Description |
| -------- | ----------- |
| `/` | Primary endpoint for the service. This path will only accept JSON `POST` requests. The posted JSON is expected to have an `action` property, which controls what the service will do. See the [Actions](#actions) section for more details. |
| `/healthcheck` | Intended for consumers to use to determine that the service is healthy and ready to receive requests. This endpoint only accepts `GET` requests, and will respond with a 200 status code if the service is healthy. |

All JSON that is POSTed to the HTTP service will be passed as-is to the underlying extractor. Which properties are required, and what each does is largely up to the extractor; however, the following values are generally required by the service itself:

| Name | Type | Description |
| ---- | ---- | ----------- |
| `spaceId` | JSON property | ID of the space that is the target of the operation. |
| `sourceId` | JSON property | ID of the source that is the target of the operation. |
| `AWS_ACCESS_KEY_ID` | Environment Variable | ID of the access key that can be used to authenticate with AWS. |
| `AWS_SECRET_ACCESS_KEY` | Environment Variable | Secret for the access key that can be used to authenticate with AWS. |

#### Actions

The values listed below are valid when used in the `action` property of a request to the service.

##### extract

Instructs the service to extract and ingest assets. The extraction process is set up to "page" through assets, meaning that it will extract a subset of assets from the target, ingest them, and then repeat the process for the next subset of assets.

In addition to the generally required properties and environment variables, the `extract` action requires the following:

| Name | Type | Description |
| ---- | ---- | ----------- |
| `jobId` | JSON property | ID that can be used to identify an individual extraction job execution. |
| `cursor` | JSON property | Optional, but when provided, the location from which the current extract request should begin. When missing, the first location is assumed. |
| `INGESTOR_API_KEY` | Environment Variable | API key to use when sending ingestion requests to the ingestion service. |
| `INGESTOR_URL` | Environment Variable | Full URL of the ingestor service to use when ingesting extracted assets. |

Assuming a correct invocation, an extractor's method for retrieving assets to extract will include a payload similar to the following:

```
{
  spaceId: 'ID of space to extract',
  sourceId: 'ID of source to extract',
  jobId: 'ID for the current extraction job',
  process: {
    ingestorApiKey: 'API key that will be provided to ingestor service',
    ingestorUrl: 'URL of the ingestor service to use',
    credentials: {
        accessKeyId: 'AWS access key ID',
        secretAccessKey: 'AWS access key secret',
    },
  },
  ... //plus any other JSON properties from request body
}
```
