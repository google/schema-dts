[![Build Status](https://travis-ci.org/google/schema-dts.svg?branch=master)](https://travis-ci.org/google/schema-dts)
[![schema-dts npm version](https://badge.fury.io/js/schema-dts.svg)](https://www.npmjs.com/package/schema-dts)
[![schema-dts-gen version](https://badge.fury.io/js/schema-dts-gen.svg)](https://www.npmjs.com/package/schema-dts-gen)

# schema-dts

JSON-LD TypeScript types for Schema.org vocabulary.

**schema-dts** provides TypeScript definitions for
[Schema.org](https://schema.org/) vocabulary in JSON-LD format. The typings are
exposed as complete sets of discriminated type unions, allowing for easy
completions and stricter validation.

![Example of Code Completion using schema-dts](./example-1.gif)

This repository contains two NPM packages:

*   **[schema-dts-gen](https://www.npmjs.com/package/schema-dts-gen)** Providing
    a command-line tool to generate TypeScript files based on a specific Schema
    version and layer.
*   **[schema-dts](https://www.npmjs.com/package/schema-dts)** Pre-packaged
    TypeScript typings of latest Schema.org schema, without
    [pending](https://pending.schema.org/) and other non-core layers.

Note: This is not an officially supported Google product.

## Usage

To use the typings for your project, simply add the `schema-dts` NPM package to
your project:

    npm install schema-dts

Then you can use it as follows:

### Manually using the Schema Typings generator

    npm install schema-dts-gen
    npx schema-dts-gen --schema=3.4

## Developers

Use NPM to install dependencies:

    npm install

Use Gulp to build the package:

    gulp generate-ts

or simply build the schema-dts generator:

    gulp build-generator

To contribute changes, see [the CONTRIBUTING.md file](./CONTRIBUTING.md).
