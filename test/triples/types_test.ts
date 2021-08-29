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
import {Rdfs, SchemaString, UrlNode} from '../../src/triples/types.js';

describe('UrlNode', () => {
  it('parses rdf-syntax', () => {
    const node = UrlNode.Parse(
      'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'
    );

    expect(node.name).toBe('type');
    expect(node.context.href).toBe(
      'http://www.w3.org/1999/02/22-rdf-syntax-ns'
    );
    expect(node.context.hostname).toBe('www.w3.org');
    expect(node.context.path).toEqual(['1999', '02', '22-rdf-syntax-ns']);
  });

  it('parses rdf-schema', () => {
    const node = UrlNode.Parse('http://www.w3.org/2000/01/rdf-schema#Class');

    expect(node.name).toBe('Class');
    expect(node.context.href).toBe('http://www.w3.org/2000/01/rdf-schema');
    expect(node.context.hostname).toBe('www.w3.org');
    expect(node.context.path).toEqual(['2000', '01', 'rdf-schema']);
  });

  it('parses schema.org concepts', () => {
    const node = UrlNode.Parse('http://schema.org/domainIncludes');

    expect(node.name).toBe('domainIncludes');
    expect(node.context.href).toBe('http://schema.org/');
    expect(node.context.hostname).toBe('schema.org');
    expect(node.context.path).toEqual(['']);
  });

  it('rejects search strings', () => {
    expect(() =>
      UrlNode.Parse('http://schema.org/Person?q=true&a')
    ).toThrowError('Search string');

    expect(() => UrlNode.Parse('http://schema.org/Person?q&a')).toThrowError(
      'Search string'
    );

    expect(() => UrlNode.Parse('http://schema.org/Person?q')).toThrowError(
      'Search string'
    );

    expect(() =>
      UrlNode.Parse('http://schema.org/abc?q#foo')
    ).not.toThrowError();
    expect(() => UrlNode.Parse('http://schema.org/abc#?q')).not.toThrowError();
  });

  it('top-level domain', () => {
    expect(() => UrlNode.Parse('http://schema.org/')).toThrowError(
      "no room for 'name'"
    );

    expect(() => UrlNode.Parse('http://schema.org')).toThrowError(
      "no room for 'name'"
    );

    expect(() => UrlNode.Parse('http://schema.org/#foo')).not.toThrowError();
  });

  describe('matches context', () => {
    it('matches exact urls', () => {
      expect(
        UrlNode.Parse('http://schema.org/Person').matchesContext(
          'http://schema.org/'
        )
      ).toBe(true);

      expect(
        UrlNode.Parse('http://schema.org/Person').matchesContext(
          'http://schema.org'
        )
      ).toBe(true);

      expect(
        UrlNode.Parse('https://schema.org/Person').matchesContext(
          'https://schema.org'
        )
      ).toBe(true);

      expect(
        UrlNode.Parse('https://schema.org/Person').matchesContext(
          'https://schema.org/'
        )
      ).toBe(true);
    });

    it('http matches https', () => {
      expect(
        UrlNode.Parse('http://schema.org/Person').matchesContext(
          'https://schema.org/'
        )
      ).toBe(true);
    });

    it('https does not matche http (security)', () => {
      expect(
        UrlNode.Parse('https://schema.org/Person').matchesContext(
          'http://schema.org/'
        )
      ).toBe(false);
    });

    it('matches exact path', () => {
      expect(
        UrlNode.Parse('https://webschema.com/5.0/Person').matchesContext(
          'https://webschema.com/5.0'
        )
      ).toBe(true);

      expect(
        UrlNode.Parse('https://webschema.com/5.0#Person').matchesContext(
          'https://webschema.com/5.0'
        )
      ).toBe(true);
    });

    it('different URLs', () => {
      expect(
        UrlNode.Parse('https://webschema.com/5.0/Person').matchesContext(
          'https://foo.com/5.0'
        )
      ).toBe(false);

      expect(
        UrlNode.Parse('https://webschema.com/5.0#Person').matchesContext(
          'https://foo.com/5.0'
        )
      ).toBe(false);
    });

    it('different path lengths', () => {
      expect(
        UrlNode.Parse('https://webschema.com/5.0/g/Person').matchesContext(
          'https://webschema.com/5.0'
        )
      ).toBe(false);

      expect(
        UrlNode.Parse('https://webschema.com/5.0/Person').matchesContext(
          'https://webschema.com/g/5.0'
        )
      ).toBe(false);

      expect(
        UrlNode.Parse('https://webschema.com/5.0/g#Person').matchesContext(
          'https://webschema.com/5.0'
        )
      ).toBe(false);

      expect(
        UrlNode.Parse('https://webschema.com/5.0#Person').matchesContext(
          'https://webschema.com/5.0/g'
        )
      ).toBe(false);
    });

    it('different paths same length', () => {
      expect(
        UrlNode.Parse('https://webschema.com/6.0/Person').matchesContext(
          'https://webschema.com/5.0'
        )
      ).toBe(false);

      expect(
        UrlNode.Parse('https://webschema.com/5.0#Person').matchesContext(
          'https://webschema.com/6.0'
        )
      ).toBe(false);
    });
  });
});

describe('SchemaString', () => {
  it('parses regular strings', () => {
    const node = SchemaString.Parse('"foo"');
    expect(node).not.toBeUndefined();
    expect(node!.language).toBeUndefined();
    expect(node!.value).toBe('foo');
  });

  it('parses regular strings with escaped quotes', () => {
    const node = SchemaString.Parse('"fo\\"o\\""');
    expect(node).not.toBeUndefined();
    expect(node!.language).toBeUndefined();
    expect(node!.value).toBe('fo"o"');
  });

  it('parses strings with language', () => {
    const node = SchemaString.Parse('"bar"@en');
    expect(node).not.toBeUndefined();
    expect(node!.language).toBe('en');
    expect(node!.value).toBe('bar');
  });

  it('returns null when parsing invalid strings', () => {
    expect(SchemaString.Parse('"foo')).toBeNull();
    expect(SchemaString.Parse('foo"')).toBeNull();
    expect(SchemaString.Parse('foo"@en')).toBeNull();
    expect(SchemaString.Parse('"foo"@')).toBeNull();
    expect(SchemaString.Parse('"fo"o"')).toBeNull();
    expect(SchemaString.Parse('"fo"o"@en')).toBeNull();
  });
});

describe('Rdfs', () => {
  it('parses valid nodes', () => {
    expect(Rdfs.Parse('rdfs:foo')).not.toBeUndefined();
    expect(Rdfs.Parse('rdfs:bar')!.label).toBe('bar');
  });

  it('returns null when attempting to parse invalid nodes', () => {
    expect(Rdfs.Parse('rdfs:')).toBeNull();
    expect(Rdfs.Parse('rdf:foo')).toBeNull();
  });
});
