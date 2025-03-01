/**
 * Copyright 2023 Google LLC
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
import fs from 'fs/promises';

import {Log} from '../logging/index.js';

import {Parser, Store} from 'n3';
import type {Quad} from 'n3';

function asQuads(data: string): Quad[] {
  return new Parser({}).parse(data);
}

/**
 * Loads schema all Triples from a given Schema file and version.
 */
export async function load(url: string): Promise<Store> {
  const quads = await handleUrl(url);
  return process(quads);
}

/**
 * does the same as load(), but for a local file
 */
export async function loadFile(path: string): Promise<Store> {
  const quads = await handleFile(path);
  return process(quads);
}

async function handleFile(path: string): Promise<Quad[]> {
  const fileStr = await fs.readFile(path, {encoding: 'utf8'});
  return asQuads(fileStr);
}

function handleUrl(url: string): Promise<Quad[]> {
  return new Promise<Quad[]>((resolve, reject) => {
    https
      .get(url, response => {
        Log(`Got Response ${response.statusCode}: ${response.statusMessage}.`);
        if (response.statusCode !== 200) {
          const location =
            response.headers['location'] ||
            response.headers['content-location'];

          if (location) {
            Log(`Handling redirect to ${location}...`);
            resolve(handleUrl(location));
            return;
          }

          reject(
            new Error(
              `Got Errored Response ${response.statusCode}: ${response.statusMessage}.`,
            ),
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
            resolve(asQuads(data.join('')));
          } catch (error) {
            Log(`Caught Error on end: ${error as Error}`);
            reject(error as Error);
          }
        });

        response.on('error', error => {
          Log(`Saw error: ${error}`);
          reject(error);
        });
      })
      .on('error', reject);
  });
}

export function process(quads: Quad[]): Store {
  const filtered = quads.filter(quad => {
    if (
      quad.subject.termType === 'NamedNode' &&
      quad.subject.value.includes('file:///')
    ) {
      // Inexplicably, local files end up in the public schema for
      // certain layer overlays.
      return false;
    }

    return true;
  });
  return new Store(filtered);
}
