[![Build Status](https://github.com/google/schema-dts/actions/workflows/ci.yml/badge.svg)](https://github.com/google/schema-dts/actions/workflows/ci.yml)
[![Coverage Status](https://coveralls.io/repos/github/google/schema-dts/badge.svg?branch=main)](https://coveralls.io/github/google/schema-dts?branch=main)
[![schema-dts-gen version](https://badge.fury.io/js/schema-dts-gen.svg)](https://www.npmjs.com/package/schema-dts-gen)

# schema-dts-gen

JSONG-LD TypeScript typing generator for Schema.org vocabulary & related
ontologies.

**schema-dts-gen** is the generator that powers
[schema-dts](https://www.npmjs.com/package/schema-dts). It creates TypeScript
definitions for JSON-LD conforming to a given ontology.

Note: This is not an officially supported Google product.

## Usage

To use the typings for your project, simply add the
[`schema-dts`](https://www.npmjs.com/package/schema-dts) NPM package to your
project:

```command
npm install schema-dts-gen
npx schema-dts-gen --ontology=https://schema.org/version/latest/schemaorg-all-https.nt
```

Command line usage:

- **Specify your ontology**

  - Specify **`--ontology`**: An HTTPs URL to an .nt NTriple file declaring your
    ontology.

    Must be compatible with Schema.org, including the Schema.org `DataType`s and
    specifying a top-level `Thing` type.

- **`--context`**: Defaults to `https://schema.org`, the value or values to be
  used with the `"@context"` property.

  Can be either a single URL, or a comma separated list of two or more name:URL
  pairs.

  The context affects names of string properties in types, as well as the values
  of an object's `"@type"`.

- **`--deprecated`**/**`--nodeprecated`**: Whether or not to include deprecated
  Schema.org types and properties. When included, these types will still be
  marked with `@deprecated` JSDOC tags.

- **`--verbose`**: Outputs additional logs and debugging notes to stderr.
