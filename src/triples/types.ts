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

import {URL} from 'url';

/** Describes URL components of a "Context". */
export interface ReadonlyUrl {
  readonly href: string;
  readonly protocol: string;
  readonly hostname: string;
  readonly path: ReadonlyArray<string>;
  readonly search: string;
}
function fromString(urlString: string): ReadonlyUrl {
  const url = new URL(urlString);
  return {
    href: url.href,
    protocol: url.protocol,
    hostname: url.hostname,
    path: url.pathname.slice(1).split('/'),
    search: url.search
  };
}
function pathEqual(
    first: ReadonlyArray<string>, second: ReadonlyArray<string>) {
  if (first.length !== second.length) return false;
  for (let i = 0; i < first.length; ++i) {
    if (first[i] !== second[i]) return false;
  }
  return true;
}

/**
 * In-memory representation of a node in a Triple corresponding to a URL.
 * @example <http://schema.org/domainIncludes>
 */
export class UrlNode {
  readonly type = 'UrlNode';
  constructor(
      readonly name: string, readonly context: ReadonlyUrl,
      readonly href: string) {}

  toString() {
    return this.href;
  }

  matchesContext(contextString: string): boolean {
    const context = fromString(contextString);
    if (this.context.protocol !== context.protocol) {
      // Schema.org schema uses 'http:' as protocol, but increasingly Schema.org
      // recommends using https: instead.
      //
      // If UrlNode is http and provided context is https, consider this a match
      // still...
      if (this.context.protocol === 'http:' && context.protocol === 'https:') {
        // Ignore.
      } else {
        return false;
      }
    }

    return this.context.hostname === context.hostname &&
        pathEqual(this.context.path, context.path) &&
        this.context.search === context.search;
  }

  static Parse(urlString: string): UrlNode {
    const url = new URL(urlString);

    if (url.hash) {
      return new UrlNode(
          /*name=*/url.hash.slice(1),
          /*context=*/fromString(url.origin + url.pathname + url.search),
          /*href=*/url.href);
    }

    if (url.search) {
      throw new Error(
          `Can't handle Search string in ${url.search} in ${url.href}`);
    }

    const split = url.pathname.split('/');
    const name = split.pop();
    if (!name) {
      throw new Error(`Unexpected URL ${url.href} with no room for 'name'.`);
    }
    const context = url.origin + split.join('/');

    return new UrlNode(name, fromString(context), url.href);
  }
}

/**
 * In-memory representation of a node in a Triple corresponding to a string
 * literal.
 * @example "BodyOfWater"
 * @example "BodyOfWater"@en
 */
export class SchemaString {
  readonly type = 'SchemaString';
  constructor(readonly value: string, readonly language: string|undefined) {}
  toString() {
    return this.language ? `"${this.value}@${this.language}` :
                           `"${this.value}"`;
  }
  static Parse(content: string): SchemaString|null {
    const result = /^"(([^"]|(\\"))+)"(?:@([a-zA-Z]+))?$/.exec(content);
    if (result) {
      return new SchemaString(result[1].replace(/\\"/g, '"'), result[4]);
    }
    return null;
  }
}

/**
 * In-memory representation of a compact Node corresponding to a relative RDFS
 * reference.
 * @example <rdfs:label>
 */
export class Rdfs {
  readonly type = 'Rdfs';
  constructor(readonly label: string) {}
  toString() {
    return `rdfs:${this.label}`;
  }
  static Parse(content: string): Rdfs|null {
    const result = /^rdfs:(.+)$/.exec(content);
    return result && new Rdfs(result[1]);
  }
}
