/**
 * Copyright 2020 Google LLC
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

import {expect} from 'chai';

import {CustomOntology, IsCustom, ParseFlags, StandardOntology} from '../../src/cli/args';

describe('ParseFlags', () => {
  it('defaults', () => {
    const options = ParseFlags([])!;
    expect(options).not.to.be.undefined;
    expect(options.context).to.equal('https://schema.org');
    expect(options.deprecated).to.be.true;
    expect(options.verbose).to.be.false;
    expect(IsCustom(options)).to.be.false;

    const standard = options as StandardOntology;
    expect(standard.layer).to.equal('all-layers');
    expect(standard.schema).to.equal('latest');
  });

  it('custom ontology', () => {
    const options = ParseFlags(['--ontology', 'https://google.com/foo'])!;
    expect(options).not.to.be.undefined;
    expect(IsCustom(options)).to.be.true;

    const custom = options as CustomOntology;
    expect(custom.ontology).to.equal('https://google.com/foo');
  });
});
