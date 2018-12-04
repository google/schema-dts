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
import https from 'https';
import {Observable} from 'rxjs';

import {TObject, Triple} from './triple';
import {Rdfs, SchemaString, UrlNode} from './types';

function verify<T>(
    content: string, ...rest: Array<(content: string) => T | null>): T {
  for (const item of rest) {
    const attempt = item(content);
    if (attempt) return attempt;
  }
  throw new Error(`Unexpected ${content}`);
}
function unWrap<T>(maker: (content: string) => T | null): (content: string) =>
    T | null {
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
  return verify<TObject>(
      content, unWrap(Rdfs.Parse), unWrap(UrlNode.Parse), SchemaString.Parse);
}
const totalRegex =
    /\s*<([^<>]+)>\s*<([^<>]+)>\s*((?:<[^<>"]+>)|(?:"(?:[^"]|(?:\\"))+(?:[^\"]|\\")"(?:@[a-zA-Z]+)?))\s*\./;

export function load(version: string, file = 'schema.nt'): Observable<Triple> {
  return new Observable<Triple>(subscriber => {
    https
        .get(
            `https://schema.org/version/${version}/${file}.nt`,
            response => {
              const data: string[] = [];

              function process(triples: string[][]): void {
                for (const match of triples) {
                  if (match.length !== 3) {
                    subscriber.error(new Error(`Unexpected ${match}`));
                  }

                  if (match[0].includes('file:///')) {
                    // Inexplicably, local files end up in the public schema for
                    // certain layer overlays.
                    continue;
                  }
                  if (match[0] === 'http://meta.schema.org/') {
                    continue;
                  }

                  if (match[1] ===
                          'http://www.w3.org/2002/07/owl#equivalentClass' ||
                      match[1] ===
                          'http://www.w3.org/2002/07/owl#equivalentProperty' ||
                      match[1] === 'http://purl.org/dc/terms/source' ||
                      match[1] ===
                          'http://www.w3.org/2000/01/rdf-schema#label' ||
                      match[1] ===
                          'http://www.w3.org/2004/02/skos/core#closeMatch' ||
                      match[1] ===
                          'http://www.w3.org/2004/02/skos/core#exactMatch') {
                    // Skip Equivalent Classes & Properties
                    continue;
                  }

                  if (match[1] === 'http://schema.org/isPartOf') {
                    // When isPartOf is used as a predicate, is a higher-order
                    // property describing if a Property or Class is part of a
                    // specific schema layer. We don't use that information yet,
                    // so discard it.
                    continue;
                  }

                  try {
                    subscriber.next({
                      Subject: subject(match[0]),
                      Predicate: predicate(match[1]),
                      Object: object(match[2])
                    });
                  } catch (parseError) {
                    throw new Error(`${
                        parseError.stack ||
                        String(parseError)} while parsing line ${match}.`);
                  }
                }
              }

              response.on('data', (chunkB: Buffer) => {
                const chunk = chunkB.toString('utf-8');
                data.push(chunk);
              });

              response.on('end', () => {
                const linearTriples = data.join('')
                                          .split(totalRegex)
                                          .map(s => s.trim())
                                          .filter(s => s.length > 0);

                const triples =
                    linearTriples.reduce((result, value, index, array) => {
                      if (index % 3 === 0) {
                        result.push(array.slice(index, index + 3));
                      }
                      return result;
                    }, [] as string[][]);

                process(triples);

                subscriber.complete();
              });

              response.on('error', error => {
                subscriber.error(error);
              });
            })
        .on('error', e => subscriber.error(e));
  });
}
