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
import {stub} from 'sinon';
import {UrlNode} from '../../src/triples/types';
import {EnumValue} from '../../src/ts/enum';
import {makeClass, makeClassMap} from '../helpers/make_class';

describe('EnumValue', () => {
  describe('constructor', () => {
    it('Throws when referencing a non-existent type', () => {
      const map = makeClassMap(
          makeClass('https://schema.org/Foo'),
          makeClass('https://schema.org/Bar'),
          makeClass('https://schema.org/Baz'));
      expect(
          () => new EnumValue(
              UrlNode.Parse('https://schema.org/Wednesday'),
              [UrlNode.Parse('https://schema.org/DayOfWeek')], map))
          .to.throw('Couldn\'t find');
    });

    it('Works fine when called for plain enum', () => {
      const dayOfWeek = makeClass('https://schema.org/DayOfWeek');
      const addEnum = stub(dayOfWeek, 'addEnum');
      const map = makeClassMap(
          makeClass('https://schema.org/Foo'),
          makeClass('https://schema.org/Bar'), dayOfWeek);

      const myEnum = new EnumValue(
          UrlNode.Parse('https://schema.org/Wednesday'),
          [UrlNode.Parse('https://schema.org/DayOfWeek')], map);

      expect(addEnum.calledWith(myEnum)).to.be.true;
      addEnum.restore();
    });

    it('Works fine when called for an enum/class', () => {
      const medicalProcedureType =
          makeClass('https://schema.org/MedicalProcedureType');
      const addEnum = stub(medicalProcedureType, 'addEnum');

      const map = makeClassMap(
          makeClass('https://schema.org/Foo'),
          makeClass('https://schema.org/Bar'), medicalProcedureType);

      const myEnum = new EnumValue(
          UrlNode.Parse('https://schema.org/SurgicalProcedure'),
          [
            UrlNode.Parse('https://schema.org/MedicalProcedureType'),
            UrlNode.Parse('http://www.w3.org/2000/01/rdf-schema#Class')
          ],
          map);

      expect(addEnum.calledWith(myEnum)).to.be.true;
      addEnum.restore();
    });
  });
});