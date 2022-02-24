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
import {SchemaString, UrlNode} from './types.js';

import {Parser} from 'n3';
import type {Quad, Quad_Subject, Quad_Predicate, Quad_Object} from 'n3';

function subject(s: Quad_Subject) {
  assert(
    s.termType === 'NamedNode',
    `Only NamedNode is supported for Subject. Saw ${s.termType}`
  );
  return UrlNode.Parse(s.value);
}

function predicate(p: Quad_Predicate) {
  assert(
    p.termType === 'NamedNode',
    `Only NamedNode is supported for Predicate. Saw ${p.termType}`
  );
  return UrlNode.Parse(p.value);
}

function object(o: Quad_Object) {
  switch (o.termType) {
    case 'NamedNode':
      return UrlNode.Parse(o.value);
    case 'Literal':
      return new SchemaString(o.value);
    case 'BlankNode':
    case 'Variable':
    default:
      throw new Error(`Unexpected ${o.termType} for object ${o.toJSON()}`);
  }
}

function toTripleStrings(data: string[]): Quad[] {
  return new Parser({}).parse(data.join(''));
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

export function process(quads: Quad[]): Triple[] {
  return quads
    .filter(quad => {
      if (
        quad.subject.termType === 'NamedNode' &&
        quad.subject.value.includes('file:///')
      ) {
        // Inexplicably, local files end up in the public schema for
        // certain layer overlays.
        return false;
      }

      return true;
    })
    .map(
      (quad: Quad): Triple => ({
        Subject: subject(quad.subject),
        Predicate: predicate(quad.predicate),
        Object: object(quad.object),
      })
    );
}
