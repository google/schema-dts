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

import {URL} from 'url';

/** Describes URL components of a "Context". */
export interface ReadonlyUrl {
  readonly href: string;
  readonly protocol: string;
  readonly hostname: string;
  readonly path: readonly string[];
  readonly search: string;
}
function fromUrl(url: URL): ReadonlyUrl {
  return {
    href: url.href,
    protocol: url.protocol,
    hostname: url.hostname,
    path: url.pathname.slice(1).split('/'),
    search: url.search,
  };
}
function fromString(urlString: string): ReadonlyUrl {
  return fromUrl(new URL(urlString));
}
function pathEqual(first: readonly string[], second: readonly string[]) {
  if (first.length !== second.length) return false;
  for (let i = 0; i < first.length; ++i) {
    if (first[i] !== second[i]) return false;
  }
  return true;
}

/**
 * In-memory representation of a node in a Triple corresponding to a URL.
 *
 * @example <http://schema.org/domainIncludes>
 */
export class UrlNode {
  readonly type = 'UrlNode';
  constructor(
    readonly name: string | undefined,
    readonly context: ReadonlyUrl,
    readonly href: string
  ) {}

  toString() {
    return this.href;
  }

  matchesContext(contextIn: string | ReadonlyUrl): boolean {
    const context =
      typeof contextIn === 'string' ? fromString(contextIn) : contextIn;
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

    return (
      this.context.hostname === context.hostname &&
      pathEqual(this.context.path, context.path) &&
      this.context.search === context.search
    );
  }

  equivTo(other: UrlNode): boolean {
    return (
      this.href === other.href ||
      (this.matchesContext(other.context) && this.name === other.name)
    );
  }

  static Parse(urlString: string): UrlNode {
    const url = new URL(urlString);

    if (url.hash) {
      return new UrlNode(
        /*name=*/ url.hash.slice(1),
        /*context=*/ fromString(url.origin + url.pathname + url.search),
        /*href=*/ url.href
      );
    }

    if (url.search) {
      // A URL with no hash but some "?..." search params
      // should be treated the same as an unnamed URL.
      return new UrlNode(
        /*name=*/ undefined,
        /*context=*/ fromUrl(url),
        /*href=*/ url.href
      );
    }

    const split = url.pathname.split('/');
    let name = split.pop();
    if (name === '') name = undefined;

    const context = url.origin + split.join('/');

    return new UrlNode(name, fromString(context), url.href);
  }
}
export type NamedUrlNode = UrlNode & {name: string};

/**
 * In-memory representation of a node in a Triple corresponding to a string
 * literal.
 *
 * @example "BodyOfWater"
 * @example "BodyOfWater"@en
 */
export class SchemaString {
  readonly type = 'SchemaString';
  constructor(readonly value: string) {}
  toString() {
    return `"${this.value}"`;
  }
}
