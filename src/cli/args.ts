/**
 * Copyright 2018 Google LLC
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
  verbose: boolean;
  schema: string;
  layer: string;
  deprecated: boolean;
  context: string;
}
export function ParseFlags(): Options|undefined {
  const parser = new ArgumentParser(
      {version: '0.0.1', addHelp: true, description: 'schema-dts generator'});

  const verbose = parser.addMutuallyExclusiveGroup({required: false});
  verbose.addArgument(
      '--verbose', {defaultValue: false, action: 'storeTrue', dest: 'verbose'});
  verbose.addArgument('--noverbose', {action: 'storeFalse', dest: 'verbose'});

  parser.addArgument('--schema', {
    defaultValue: '3.4',
    help: 'The version of the schema to load.',
    metavar: 'version',
    dest: 'schema'
  });
  parser.addArgument('--layer', {
    defaultValue: 'all-layers',
    help: 'Which layer of the schema to load? E.g. schema or all-layers.',
    metavar: 'name_of_file',
    dest: 'layer'
  });
  parser.addArgument('--context', {
    defaultValue: 'https://schema.org',
    help: 'Single URL or comma-separated key:value pairs defining the ' +
        'intended \'@context\' for the generated JSON-LD typings. ' +
        'By default, this is \'https://schema.org\`. Alternatively: ' +
        '--context=rdf:http://www.w3.org/2000/01/rdf-schema,' +
        'schema:https://schema.org\n' +
        'would result in \'rdf:\' being a prefix for any RDF Schema ' +
        'property, and \'schema:\' being a prefix for any Schema.org property.',
    metavar: 'key1:url,key2:url,...',
    dest: 'context'
  });

  const deprecated = parser.addMutuallyExclusiveGroup({required: false});
  deprecated.addArgument('--deprecated', {
    defaultValue: {defaultValue: true},
    help: 'Include deprecated Classes and Properties.',
    action: 'storeTrue',
    dest: 'deprecated'
  });
  deprecated.addArgument('--nodeprecated', {
    help: 'Skip deprecated Classes and Properties.',
    action: 'storeFalse',
    dest: 'deprecated'
  });
  return parser.parseArgs();
}
