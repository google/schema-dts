/**
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {ArgumentParser} from 'argparse';

export interface Options {
  /** HTTPS URL to an .nt file defining a custom ontology. */
  ontology: string;
  file: string | undefined;
  verbose: boolean;
  deprecated: boolean;
  context: string;
}

// argparse forces snake_case on us.
/* eslint @typescript-eslint/naming-convention: 0 */
/* eslint camelcase: 0 */
export function ParseFlags(args?: string[]): Options {
  const parser = new ArgumentParser({
    add_help: true,
    description: 'schema-dts generator',
  });

  const verbose = parser.add_mutually_exclusive_group({required: false});
  verbose.add_argument('--verbose', {
    default: false,
    action: 'store_true',
    dest: 'verbose',
  });
  verbose.add_argument('--noverbose', {action: 'store_false', dest: 'verbose'});

  parser.add_argument('--schema', {
    default: undefined,
    help: 'Deprecated. Please use --ontology instead.',
    metavar: 'version',
    dest: 'schema',
    type: DeprecatedValue,
  });
  parser.add_argument('--layer', {
    default: undefined,
    help: 'Deprecated. Please use --ontology instead.',
    metavar: 'name_of_file',
    dest: 'layer',
    type: DeprecatedValue,
  });
  parser.add_argument('--context', {
    default: 'https://schema.org',
    help:
      'Single URL or comma-separated key:value pairs defining the ' +
      "intended '@context' for the generated JSON-LD typings. " +
      "By default, this is 'https://schema.org`. Alternatively: " +
      '--context=rdf:http://www.w3.org/2000/01/rdf-schema,' +
      'schema:https://schema.org\n' +
      "would result in 'rdf:' being a prefix for any RDF Schema " +
      "property, and 'schema:' being a prefix for any Schema.org property.",
    metavar: 'key1:url,key2:url,...',
    dest: 'context',
  });
  parser.add_argument('--ontology', {
    default: 'https://schema.org/version/latest/schemaorg-current-https.nt',
    help:
      'HTTPS URL to a custom .nt file defining an entirely self-' +
      'sufficient schema. The schema must still be described in terms of ' +
      "Schema.org DataTypes, as well as rdf/rdfs concepts like 'type', " +
      "'domainIncludes', and 'rangeIncludes'.",
    metavar: 'https://url.to/schema.nt',
    dest: 'ontology',
  });
  parser.add_argument('--file', {
    default: undefined,
    help: 'file path to a .nt file, for using a local ontology file',
    dest: 'file',
  });

  const deprecated = parser.add_mutually_exclusive_group({required: false});
  deprecated.add_argument('--deprecated', {
    default: true,
    help: 'Include deprecated Classes and Properties.',
    action: 'store_true',
    dest: 'deprecated',
  });
  deprecated.add_argument('--nodeprecated', {
    help: 'Skip deprecated Classes and Properties.',
    action: 'store_false',
    dest: 'deprecated',
  });
  return parser.parse_args(args);
}

function DeprecatedValue(item: unknown) {
  throw new Error('This command line argument is deprecated.');
}
