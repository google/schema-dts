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
import {UrlNode} from '../../src/triples/types.js';

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

  it('treats search strings as unnamed', () => {
    const node = UrlNode.Parse('http://schema.org/Person?q=true&a');
    expect(node.name).toBeUndefined();
    expect(node.context.href).toBe('http://schema.org/Person?q=true&a');
  });

  it('treats top-level domain as unnamed', () => {
    expect(UrlNode.Parse('http://schema.org/').name).toBeUndefined();
    expect(UrlNode.Parse('http://schema.org').name).toBeUndefined();
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
