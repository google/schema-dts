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
import {jest} from '@jest/globals';

import {ParseFlags} from '../../src/cli/args.js';
import {ArgumentParser} from 'argparse';

describe('ParseFlags', () => {
  it('defaults', () => {
    const options = ParseFlags([])!;
    expect(options).not.toBeUndefined();
    expect(options.context).toBe('https://schema.org');
    expect(options.deprecated).toBe(true);
    expect(options.verbose).toBe(false);
    expect(options.file).toBeUndefined();

    expect(options.ontology).toBe(
      'https://schema.org/version/latest/schemaorg-current-https.nt'
    );
  });

  it('custom ontology', () => {
    const options = ParseFlags(['--ontology', 'https://google.com/foo'])!;
    expect(options).not.toBeUndefined();

    expect(options.ontology).toBe('https://google.com/foo');
  });

  it('custom file', () => {
    const options = ParseFlags(['--file', './ontology.nt'])!;
    expect(options).not.toBeUndefined();

    expect(options.file).toBe('./ontology.nt');
  });

  describe('deprecated fields', () => {
    beforeEach(() => {
      jest.spyOn(ArgumentParser.prototype, 'exit').mockImplementation(e => {
        throw new Error(`${e}`);
      });
    });

    it('--layer', () => {
      expect(() => ParseFlags(['--layer', 'foo'])).toThrow();
    });

    it('--schema', () => {
      expect(() => ParseFlags(['--schema', 'bar'])).toThrow();
    });
  });
});
