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
import {NamedNode} from 'n3';

import {EnumValue} from '../../src/ts/enum.js';
import {makeClass, makeClassMap} from '../helpers/make_class.js';

describe('EnumValue', () => {
  describe('constructor', () => {
    it('Throws when referencing a non-existent type', () => {
      const map = makeClassMap(
        makeClass('https://schema.org/Foo'),
        makeClass('https://schema.org/Bar'),
        makeClass('https://schema.org/Baz')
      );
      expect(
        () =>
          new EnumValue(
            new NamedNode('https://schema.org/Wednesday'),
            [new NamedNode('https://schema.org/DayOfWeek')],
            map
          )
      ).toThrowError("Couldn't find");
    });

    it('Works fine when called for plain enum', () => {
      const dayOfWeek = makeClass('https://schema.org/DayOfWeek');
      const addEnum = jest.fn();
      dayOfWeek.addEnum = addEnum;

      const map = makeClassMap(
        makeClass('https://schema.org/Foo'),
        makeClass('https://schema.org/Bar'),
        dayOfWeek
      );

      const myEnum = new EnumValue(
        new NamedNode('https://schema.org/Wednesday'),
        [new NamedNode('https://schema.org/DayOfWeek')],
        map
      );

      expect(addEnum).toBeCalledWith(myEnum);
    });

    it('Works fine when called for an enum/class', () => {
      const medicalProcedureType = makeClass(
        'https://schema.org/MedicalProcedureType'
      );
      const addEnum = jest.fn();
      medicalProcedureType.addEnum = addEnum;

      const map = makeClassMap(
        makeClass('https://schema.org/Foo'),
        makeClass('https://schema.org/Bar'),
        medicalProcedureType
      );

      const myEnum = new EnumValue(
        new NamedNode('https://schema.org/SurgicalProcedure'),
        [
          new NamedNode('https://schema.org/MedicalProcedureType'),
          new NamedNode('http://www.w3.org/2000/01/rdf-schema#Class'),
        ],
        map
      );

      expect(addEnum).toBeCalledWith(myEnum);
    });
  });
});
