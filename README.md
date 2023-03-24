# Content Lake - Extractors Shared

Shared libraries for extractors

## Status
[![codecov](https://img.shields.io/codecov/c/github/adobe/content-lake-extractors-shared.svg)](https://codecov.io/gh/adobe/content-lake-extractors-shared)
[![CircleCI](https://img.shields.io/circleci/project/github/adobe/content-lake-extractors-shared.svg)](https://circleci.com/gh/adobe/content-lake-extractors-shared)
[![GitHub license](https://img.shields.io/github/license/adobe/content-lake-extractors-shared.svg)](https://github.com/adobe/content-lake-extractors-shared/blob/master/LICENSE.txt)
[![GitHub issues](https://img.shields.io/github/issues/adobe/content-lake-extractors-shared.svg)](https://github.com/adobe/content-lake-extractors-shared/issues)
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

### Integration Test

The integration tests require the following environment variables which can be set via a .env file:

```
AWS_REGION=
AWS_ACCESS_KEY_ID=
AWS_ACCESS_SECRET_KEY=
QUEUE_URL=
```

```bash
$ npm run test:integration
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