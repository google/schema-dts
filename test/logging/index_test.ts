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

import {Log, SetLogger, SetOptions} from '../../src/logging/index.js';
import {Mocked} from '../helpers/jest-types.js';

describe('Log', () => {
  let logErr: Mocked<Console['error']>;
  let ResetLogger: undefined | (() => void) = undefined;

  beforeEach(() => {
    logErr = jest.fn();
    ResetLogger = SetLogger(logErr);
  });

  afterEach(() => {
    ResetLogger && ResetLogger();
  });

  it("doesn't log by default", () => {
    Log('Foo');
    expect(logErr).not.toBeCalled();
  });

  it("doesn't log when verbose=false", () => {
    SetOptions({verbose: false});
    Log('Foo');
    expect(logErr).not.toBeCalled();
  });

  it('logs when verbose=true', () => {
    SetOptions({verbose: true});
    Log('Foo');
    expect(logErr).toBeCalledWith('Foo');
  });

  it('stops logging after turned off', () => {
    SetOptions({verbose: true});
    Log('Foo');
    SetOptions({verbose: false});
    Log('Bar');

    expect(logErr).toBeCalledWith('Foo');
    expect(logErr).not.toBeCalledWith('Bar');
  });
});
