[![Build Status](https://travis-ci.org/google/schema-dts.svg?branch=master)](https://travis-ci.org/google/schema-dts)
[![Coverage Status](https://coveralls.io/repos/github/google/schema-dts/badge.svg?branch=master)](https://coveralls.io/github/google/schema-dts?branch=master)
[![schema-dts npm version](https://badge.fury.io/js/schema-dts.svg)](https://www.npmjs.com/package/schema-dts)

# schema-dts

JSON-LD TypeScript types for Schema.org vocabulary.

**schema-dts** provides TypeScript definitions for
[Schema.org](https://schema.org/) vocabulary in JSON-LD format. The typings are
exposed as complete sets of discriminated type unions, allowing for easy
completions and stricter validation.

![Example of Code Completion using schema-dts](https://raw.githubusercontent.com/google/schema-dts/HEAD/example-1.gif)

Note: This is not an officially supported Google product.

## Usage

To use the typings for your project, simply add the `schema-dts` NPM package to
your project:

    npm install schema-dts

Then you can use it by importing `"schema-dts"`.

## Examples

### Defining Simple Properties

```ts
import {Person} from "schema-dts";

const inventor: Person = {
    "@type": "Person",
    "name": "Grace Hopper",
    "disambiguatingDescription": "American computer scientist",
    "birthDate": "1906-12-09",
    "deathDate": "1992-01-01",
    "awards": [
        "Presidential Medal of Freedom",
        "National Medal of Technology and Innovation",
        "IEEE Emanuel R. Piore Award",
    ]
};
```
### Using 'Context'

JSON-LD requires a `"@context"` property to be set on the top-level JSON object,
to describe the URIs represeting the types and properties being referenced.
schema-dts provides the `WithContext<T>` type to facilitate this.

```ts
import {Organization, Thing, WithContext} from "schema-dts";

export function JsonLd<T extends Thing>(json: T): string {
    return `<script type="application/ld+json">
${JSON.stringify(json)}
</script>`;
}

export const MY_ORG = JsonLd<Organization>({
    "@context": "https://schema.org",
    "@type": "Corporation",
    "name": "Google LLC"
});
```
