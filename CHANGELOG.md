## [2.1.8](https://github.com/adobe/content-lake-extractors-shared/compare/v2.1.7...v2.1.8) (2023-04-08)


### Bug Fixes

* **deps:** update external fixes ([84e0eb0](https://github.com/adobe/content-lake-extractors-shared/commit/84e0eb06890aca38caafb02a2f8dedf2b45a1a75))

## [2.1.7](https://github.com/adobe/content-lake-extractors-shared/compare/v2.1.6...v2.1.7) (2023-04-08)


### Bug Fixes

* **deps:** update dependency @adobe/content-lake-commons to v1.3.1 ([136d06c](https://github.com/adobe/content-lake-extractors-shared/commit/136d06c8eb6477ed7c7d75fd709eb51514da9b4e))

## [2.1.6](https://github.com/adobe/content-lake-extractors-shared/compare/v2.1.5...v2.1.6) (2023-04-01)


### Bug Fixes

* **deps:** update external fixes ([b250f44](https://github.com/adobe/content-lake-extractors-shared/commit/b250f44db99ca82095df1e4c0def8d48caa46c8c))

## [2.1.5](https://github.com/adobe/content-lake-extractors-shared/compare/v2.1.4...v2.1.5) (2023-03-28)


### Bug Fixes

* use queue blob storage to store oversized messages ([#42](https://github.com/adobe/content-lake-extractors-shared/issues/42)) ([0da9e3f](https://github.com/adobe/content-lake-extractors-shared/commit/0da9e3fb0ab806cb73ca27fe85c7787f323e528a))

## [2.1.4](https://github.com/adobe/content-lake-extractors-shared/compare/v2.1.3...v2.1.4) (2023-03-25)


### Bug Fixes

* **deps:** update dependency @adobe/content-lake-commons to v1.2.2 ([5cfab0c](https://github.com/adobe/content-lake-extractors-shared/commit/5cfab0c0dfe8f8f29e444356b4b366c591816435))

## [2.1.3](https://github.com/adobe/content-lake-extractors-shared/compare/v2.1.2...v2.1.3) (2023-03-25)


### Bug Fixes

* **deps:** update external fixes ([8beca1b](https://github.com/adobe/content-lake-extractors-shared/commit/8beca1b1f13ac524930d627c707f976d0f70fc31))

## [2.1.2](https://github.com/adobe/content-lake-extractors-shared/compare/v2.1.1...v2.1.2) (2023-03-24)


### Bug Fixes

* **deps:** update dependency @adobe/content-lake-commons to v1.2.1 ([f4c12b1](https://github.com/adobe/content-lake-extractors-shared/commit/f4c12b1edc7f4e284a4b3a9ea0e688c8adf00b48))

## [2.1.1](https://github.com/adobe/content-lake-extractors-shared/compare/v2.1.0...v2.1.1) (2023-03-24)


### Bug Fixes

* separating the integration tests and improving unit test coverage of settings ([#36](https://github.com/adobe/content-lake-extractors-shared/issues/36)) ([8f233c9](https://github.com/adobe/content-lake-extractors-shared/commit/8f233c919ab3471fc50bce295724f06ab5d91450))

# [2.1.0](https://github.com/adobe/content-lake-extractors-shared/compare/v2.0.5...v2.1.0) (2023-03-23)


### Features

* adding request handler ([#33](https://github.com/adobe/content-lake-extractors-shared/issues/33)) ([311f236](https://github.com/adobe/content-lake-extractors-shared/commit/311f2363153261bddbcb2987624e7d61829c25df))

## [2.0.5](https://github.com/adobe/content-lake-extractors-shared/compare/v2.0.4...v2.0.5) (2023-03-22)


### Bug Fixes

* **deps:** update dependency @adobe/content-lake-commons to v1.2.0 ([2549208](https://github.com/adobe/content-lake-extractors-shared/commit/2549208e20317fdd256246d8d165843ca373fa6e))

## [2.0.4](https://github.com/adobe/content-lake-extractors-shared/compare/v2.0.3...v2.0.4) (2023-03-22)


### Bug Fixes

* **deps:** update dependency @adobe/content-lake-commons to v1.1.0 ([3ca6eaf](https://github.com/adobe/content-lake-extractors-shared/commit/3ca6eafe4f41f98132b7f8e046c4b264bec6e502))

## [2.0.3](https://github.com/adobe/content-lake-extractors-shared/compare/v2.0.2...v2.0.3) (2023-03-19)


### Bug Fixes

* **deps:** update dependency @adobe/content-lake-commons to v1.0.2 ([4bfca65](https://github.com/adobe/content-lake-extractors-shared/commit/4bfca65345fd3adc29188e8908ccacb59094c21f))

## [2.0.2](https://github.com/adobe/content-lake-extractors-shared/compare/v2.0.1...v2.0.2) (2023-03-18)


### Bug Fixes

* **deps:** update external fixes ([9c8dae4](https://github.com/adobe/content-lake-extractors-shared/commit/9c8dae4b11118181c8ef66d187ddacaeda29b448))

## [2.0.1](https://github.com/adobe/content-lake-extractors-shared/compare/v2.0.0...v2.0.1) (2023-03-16)


### Bug Fixes

* **deps:** update external fixes ([2959e34](https://github.com/adobe/content-lake-extractors-shared/commit/2959e34968fbeb3aa3fe2c50cc699ed223d6c399))

# [2.0.0](https://github.com/adobe/content-lake-extractors-shared/compare/v1.9.0...v2.0.0) (2023-03-16)


### Bug Fixes

* Fixing build ([5cff84e](https://github.com/adobe/content-lake-extractors-shared/commit/5cff84e5caba81f1de59fe6dbffec2f019ae2498))


### Features

* Refactor and split out ([#27](https://github.com/adobe/content-lake-extractors-shared/issues/27)) ([7cc1fe1](https://github.com/adobe/content-lake-extractors-shared/commit/7cc1fe1c77e535d4fc62ec9e294eba2eb408a8f6))


### BREAKING CHANGES

* Significantly refactored signatures and functionality split to @adobe/content-lake-commons

* feat: refactoring and renaming module

* Removing unnecessary build step

* minor - improving timeout usage for IT's

* reducing the scope of the ingestor to no longer deal with batch operations

* adding a new feature to traverse a tree or recursive batching function and process items while limiting concurrency to avoid running into request limits

* Removing function parameters, moving backend shared code to commons and reverting package name change

* Cleaning up dependencies and adding a npm ci step to the makefile

* Making sourceId also required

* Updating to use released commons

# [1.9.0](https://github.com/adobe/content-lake-extractors-shared/compare/v1.8.1...v1.9.0) (2023-03-03)


### Features

* adding the company and space id to the ingestor request ([#25](https://github.com/adobe/content-lake-extractors-shared/issues/25)) ([5302664](https://github.com/adobe/content-lake-extractors-shared/commit/53026644f7b9a008c6052fe8fc6d4a092da6e7b3))

## [1.8.1](https://github.com/adobe/content-lake-extractors-shared/compare/v1.8.0...v1.8.1) (2023-02-17)


### Bug Fixes

* trivial change to trigger build ([bbfa2d0](https://github.com/adobe/content-lake-extractors-shared/commit/bbfa2d0624e564460bfaf41cdaf3daf446fe8ffd))

# [1.8.0](https://github.com/adobe/content-lake-extractors-shared/compare/v1.7.3...v1.8.0) (2023-02-08)


### Features

* pass all asset data into getBinaryRequest method. ([#21](https://github.com/adobe/content-lake-extractors-shared/issues/21)) ([cdb06bf](https://github.com/adobe/content-lake-extractors-shared/commit/cdb06bf4a56221cb77ba868fb0a0f7f904041560))

## [1.7.3](https://github.com/adobe/content-lake-extractors-shared/compare/v1.7.2...v1.7.3) (2023-02-04)


### Bug Fixes

* improving logging of durations ([9969eb2](https://github.com/adobe/content-lake-extractors-shared/commit/9969eb2e2ed006e204aab15a712e5f41bcf436a5))

## [1.7.2](https://github.com/adobe/content-lake-extractors-shared/compare/v1.7.1...v1.7.2) (2023-02-03)


### Bug Fixes

* adding error handling when getting the binary request ([7096b29](https://github.com/adobe/content-lake-extractors-shared/commit/7096b29bbc5d790b0d41113bc765dbb0b545ec37))

## [1.7.1](https://github.com/adobe/content-lake-extractors-shared/compare/v1.7.0...v1.7.1) (2023-02-03)


### Bug Fixes

* fixing exponential backoff to backoff for a more reasonable amount of time and to not start with a zero delay ([d5cb534](https://github.com/adobe/content-lake-extractors-shared/commit/d5cb534c2833cb20503f3f59f401ff9fad0e504a))

# [1.7.0](https://github.com/adobe/content-lake-extractors-shared/compare/v1.6.3...v1.7.0) (2023-02-03)


### Features

* adding control of the limits for ingesting and getting binaries ([1f6ef20](https://github.com/adobe/content-lake-extractors-shared/commit/1f6ef209c738c07b088754129fa75fefca1d21b5))

## [1.6.3](https://github.com/adobe/content-lake-extractors-shared/compare/v1.6.2...v1.6.3) (2023-02-03)


### Bug Fixes

* improving logging ([231e605](https://github.com/adobe/content-lake-extractors-shared/commit/231e605289379770c482af156e50e4e3ddd95412))

## [1.6.2](https://github.com/adobe/content-lake-extractors-shared/compare/v1.6.1...v1.6.2) (2023-02-02)


### Bug Fixes

* re-adding response parsing to function support ([3b9b5c5](https://github.com/adobe/content-lake-extractors-shared/commit/3b9b5c54922553985726980ded9fc655c99eefeb))

## [1.6.1](https://github.com/adobe/content-lake-extractors-shared/compare/v1.6.0...v1.6.1) (2023-02-02)


### Bug Fixes

* fixing return type of ingestor ([47d04a5](https://github.com/adobe/content-lake-extractors-shared/commit/47d04a56d2679fa97c3d0be99ab71bdea55c14f4))

# [1.6.0](https://github.com/adobe/content-lake-extractors-shared/compare/v1.5.0...v1.6.0) (2023-02-02)


### Features

* modify ingestor so that second call to get asset binary info is optional. ([#17](https://github.com/adobe/content-lake-extractors-shared/issues/17)) ([bbeea03](https://github.com/adobe/content-lake-extractors-shared/commit/bbeea0367d16c5966812644692b6388ef959cab0))

# [1.5.0](https://github.com/adobe/content-lake-extractors-shared/compare/v1.4.2...v1.5.0) (2023-02-02)


### Features

* added support for settings / secrets and made fixes based on requirments to support dropbox ([2d5d694](https://github.com/adobe/content-lake-extractors-shared/commit/2d5d694150385e8300efb90fd68ed497287fd35b))

## [1.4.2](https://github.com/adobe/content-lake-extractors-shared/compare/v1.4.1...v1.4.2) (2023-02-01)


### Bug Fixes

* add capability for extractors to skip oauth authentication flow. ([#15](https://github.com/adobe/content-lake-extractors-shared/issues/15)) ([d453e49](https://github.com/adobe/content-lake-extractors-shared/commit/d453e49337b6b918a8b1e9c4ea1cc0d7c33d8fba))

## [1.4.1](https://github.com/adobe/content-lake-extractors-shared/compare/v1.4.0...v1.4.1) (2023-02-01)


### Bug Fixes

* reverting package name change ([bd32a37](https://github.com/adobe/content-lake-extractors-shared/commit/bd32a37bcd1aaaf2166b82687dcb406507647991))

# [1.4.0](https://github.com/adobe/content-lake-extractors-shared/compare/v1.3.0...v1.4.0) (2023-02-01)


### Features

* migrating to content-lake-shared from content-lake-extractors-shared ([ec43991](https://github.com/adobe/content-lake-extractors-shared/commit/ec439917af0290308dd09ff0c974fcd36164535d))

# [1.3.0](https://github.com/adobe/content-lake-extractors-shared/compare/v1.2.0...v1.3.0) (2023-02-01)


### Bug Fixes

* fixing GH build ([b02b811](https://github.com/adobe/content-lake-extractors-shared/commit/b02b8115129f99a7f97bc397c1db978eb5107f01))
* fixing secrets ([a180822](https://github.com/adobe/content-lake-extractors-shared/commit/a1808226e89824f269b0dbdef33b26026d500c08))


### Features

* Secret manager ([#14](https://github.com/adobe/content-lake-extractors-shared/issues/14)) ([3876175](https://github.com/adobe/content-lake-extractors-shared/commit/387617526cce3b46ea7d2c36a84df0d55ff0f6fa))

# [1.2.0](https://github.com/adobe/content-lake-extractors-shared/compare/v1.1.1...v1.2.0) (2023-01-31)


### Features

* Adding configuration manager ([#12](https://github.com/adobe/content-lake-extractors-shared/issues/12)) ([38e2bf8](https://github.com/adobe/content-lake-extractors-shared/commit/38e2bf8d5e149bfd3b75affcbd9dcf884fa8a4b9))
* Configuration manager - support list ([dbe6fc9](https://github.com/adobe/content-lake-extractors-shared/commit/dbe6fc959977bfc3355e00dc0a3a647ab2e18d1e))

## [1.1.1](https://github.com/adobe/content-lake-extractors-shared/compare/v1.1.0...v1.1.1) (2023-01-27)


### Bug Fixes

* misc bug fixed found while testing w/ dropbox extractor ([#9](https://github.com/adobe/content-lake-extractors-shared/issues/9)) ([ce5e475](https://github.com/adobe/content-lake-extractors-shared/commit/ce5e475c70071ebd6289998db4c2dbe96ded088f))

# [1.1.0](https://github.com/adobe/content-lake-extractors-shared/compare/v1.0.0...v1.1.0) (2023-01-26)


### Features

* Add Ingestor Client ([#8](https://github.com/adobe/content-lake-extractors-shared/issues/8)) ([2fb32f8](https://github.com/adobe/content-lake-extractors-shared/commit/2fb32f8cc7fbb62569850924fe739fb7c50a7b34))

# 1.0.0 (2023-01-24)


### Bug Fixes

* update CI to use Node 18 ([9348772](https://github.com/adobe/content-lake-extractors-shared/commit/9348772b4abee47a3112d733b11836232eb9773e))
