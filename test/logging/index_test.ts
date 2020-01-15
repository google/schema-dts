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
import {SinonStub, stub} from 'sinon';

import {Log, SetOptions} from '../../src/logging';

describe('Log', () => {
  let logErr:
      SinonStub<Parameters<Console['error']>, ReturnType<Console['error']>>;

  beforeEach(() => {
    logErr = stub(console, 'error');
  });

  afterEach(() => {
    logErr.restore();
  });

  it('doesn\'t log by default', () => {
    Log('Foo');
    expect(logErr.called).to.be.false;
  });

  it('doesn\'t log when verbose=false', () => {
    SetOptions({verbose: false});
    Log('Foo');
    expect(logErr.called).to.be.false;
  });

  it('logs when verbose=true', () => {
    SetOptions({verbose: true});
    Log('Foo');
    expect(logErr.calledWith('Foo')).to.be.true;
  });

  it('stops logging after turned off', () => {
    SetOptions({verbose: true});
    Log('Foo');
    SetOptions({verbose: false});
    Log('Bar');

    expect(logErr.calledWith('Foo')).to.be.true;
    expect(logErr.calledWith('Bar')).to.be.false;
  });
});