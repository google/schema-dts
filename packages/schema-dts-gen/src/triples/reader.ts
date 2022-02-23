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
import https from 'https';
import fs from 'fs';
import readline from 'readline';
import {Observable, Subscriber, TeardownLogic} from 'rxjs';

import {Log} from '../logging/index.js';
import {assert} from '../util/assert.js';

import {Triple} from './triple.js';
import {Rdfs, SchemaString, UrlNode} from './types.js';

function unWrap<T>(
  maker: (content: string) => T | null
): (content: string) => T | null {
  return (content: string) => {
    const result = /^<([^<>]+)>$/.exec(content);
    if (result) return maker(result[1]);
    return null;
  };
}

function subject(content: string) {
  return UrlNode.Parse(content);
}

function predicate(content: string) {
  return UrlNode.Parse(content);
}

function object(content: string) {
  const o =
    unWrap(Rdfs.Parse)(content) ||
    unWrap(UrlNode.Parse)(content) ||
    SchemaString.Parse(content);

  assert(o, `Unexpected: ${content}.`);
  return o;
}

const totalRegex =
  /\s*<([^<>]+)>\s*<([^<>]+)>\s*((?:<[^<>"]+>)|(?:"(?:[^"]|(?:\\"))*(?:[^\"]|\\")"(?:@[a-zA-Z]+)?))\s*\./;
export function toTripleStrings(data: string[]) {
  const linearTriples = data
    .join('')
    .split(totalRegex)
    .map(s => s.trim())
    .filter(s => s.length > 0);

  return linearTriples.reduce((result, _, index, array) => {
    if (index % 3 === 0) {
      result.push(array.slice(index, index + 3));
    }
    return result;
  }, [] as string[][]);
}

/**
 * Loads schema all Triples from a given Schema file and version.
 */
export function load(url: string): Observable<Triple> {
  return new Observable<Triple>(subscriber => {
    handleUrl(url, subscriber);
  });
}

/**
 * does the same as load(), but for a local file
 */
export function loadFile(path: string): Observable<Triple> {
  return new Observable<Triple>(subscriber => {
    handleFile(path, subscriber);
  });
}

function handleFile(
  path: string,
  subscriber: Subscriber<Triple>
): TeardownLogic {
  const rl = readline.createInterface({
    input: fs.createReadStream(path),
    crlfDelay: Infinity,
  });

  const data: string[] = [];

  rl.on('line', (line: string) => {
    data.push(line);
  });

  rl.on('close', () => {
    try {
      const triples = toTripleStrings(data);
      for (const triple of process(triples)) {
        subscriber.next(triple);
      }
    } catch (error) {
      Log(`Caught Error on end: ${error}`);
      subscriber.error(error);
    }
    subscriber.complete();
  });
}

function handleUrl(url: string, subscriber: Subscriber<Triple>): TeardownLogic {
  https
    .get(url, response => {
      Log(`Got Response ${response.statusCode}: ${response.statusMessage}.`);
      if (response.statusCode !== 200) {
        const location =
          response.headers['location'] || response.headers['content-location'];

        if (location) {
          Log(`Handling redirect to ${location}...`);
          handleUrl(location, subscriber);
          return;
        }

        subscriber.error(
          `Got Errored Response ${response.statusCode}: ${response.statusMessage}.`
        );
        return;
      }

      const data: string[] = [];

      response.on('data', (chunkB: Buffer) => {
        const chunk = chunkB.toString('utf-8');
        data.push(chunk);
      });

      response.on('end', () => {
        try {
          const triples = toTripleStrings(data);
          for (const triple of process(triples)) {
            subscriber.next(triple);
          }
        } catch (error) {
          Log(`Caught Error on end: ${error}`);
          subscriber.error(error);
        }

        subscriber.complete();
      });

      response.on('error', error => {
        Log(`Saw error: ${error}`);
        subscriber.error(error);
      });
    })
    .on('error', e => subscriber.error(e));
}

export function* process(triples: string[][]): Iterable<Triple> {
  for (const match of triples) {
    if (match.length !== 3) {
      throw Error(`Unexpected ${match}`);
    }

    if (match[0].includes('file:///')) {
      // Inexplicably, local files end up in the public schema for
      // certain layer overlays.
      continue;
    }

    // Schema.org 3.4 all-layers used to contain a test comment:
    // (Subject:    <http://meta.schema.org/>
    //  Predicate:  <http://www.w3.org/2000/01/rdf-schema#comment>
    //  Object:     "A test comment.")
    // We skip it manually.
    if (/http[s]?:\/\/meta\.schema\.org\//.test(match[0])) {
      continue;
    }

    if (
      match[1] === 'http://www.w3.org/2002/07/owl#equivalentClass' ||
      match[1] === 'http://www.w3.org/2002/07/owl#equivalentProperty' ||
      match[1] === 'http://purl.org/dc/terms/source' ||
      match[1] === 'http://www.w3.org/2000/01/rdf-schema#label' ||
      match[1] === 'http://www.w3.org/2004/02/skos/core#closeMatch' ||
      match[1] === 'http://www.w3.org/2004/02/skos/core#exactMatch'
    ) {
      // Skip Equivalent Classes & Properties
      continue;
    }

    if (/http[s]?:\/\/schema.org\/isPartOf/.test(match[1])) {
      // When isPartOf is used as a predicate, is a higher-order
      // property describing if a Property or Class is part of a
      // specific schema layer. We don't use that information yet,
      // so discard it.
      continue;
    }

    try {
      yield {
        Subject: subject(match[0]),
        Predicate: predicate(match[1]),
        Object: object(match[2]),
      };
    } catch (parseError) {
      const e = parseError as Error;
      throw new Error(
        `ParseError: ${e.name}: ${e.message} while parsing line ${match
          .map(t => `\{${t}\}`)
          .join(', ')}.\nOriginal Stack:\n${e.stack}\nRethrown from:`
      );
    }
  }
}
