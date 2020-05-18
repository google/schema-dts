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
import {UrlNode} from '../../src/triples/types';
import {Class, ClassMap} from '../../src/ts/class';

export function makeClass(url: string): Class {
  return new Class(UrlNode.Parse(url));
}

export function makeClassMap(...classes: Class[]): ClassMap {
  return new Map(classes.map(cls => [cls.subject.href, cls]));
}
