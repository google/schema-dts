# schema-dts

TypeScript Typings &amp; .tsd Generation for Schema.org

Schema DTS provides a set of TypeScript typings for
[schema.org](https://schema.org) schema. The typings are exposed as complete
sets of discriminated type unions, allowing for easy completions and stricter
validation.

This repository contains `generate-schema-dts`, the Node.js-based script that
generates the `schema-dts` package.

## Usage

To use the typings for your project, simply add the `schema-dts` NPM package to
your project:

    npm install schema-dts

### Manually using the Schema Typings generator

    npm install
    gulp build-generator
    node built/generator/run.js --schema=3.4

## Developers

Use NPM to install dependencies:

    npm install

Use Gulp to build the package:

    gulp generate-ts

or simply build the schema-dts generator:

    gulp build-generator

To contribute changes, see [the CONTRIBUTING.md file](./CONTRIBUTING.md).
