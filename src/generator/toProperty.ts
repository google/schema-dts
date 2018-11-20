/**
 * Copyright 2018 Google LLC
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
import {toTypeName} from './names';
import {TObject, TPredicate, TSubject} from './triple';
import {GetComment, GetType, IsRangeIncludes} from './wellKnown';

export class PropertyType {
  public readonly comments: string[] = [];
  public readonly types: TObject[] = [];
  constructor(public readonly subect: TSubject, object?: TObject) {
    if (object) this.types.push(object);
  }

  add(value: {Predicate: TPredicate; Object: TObject}): boolean {
    const c = GetComment(value);
    if (c) {
      this.comments.push(c.comment);
      return true;
    }
    if (GetType(value)) return true;  // We used types already.

    if (IsRangeIncludes(value.Predicate)) {
      this.types.push(value.Object);
      return true;
    }

    return false;
  }
}

export class Property {
  constructor(
      private readonly key: string, private readonly type: PropertyType) {}

  required() {
    return this.key.startsWith('@');
  }

  toString() {
    return (
        this.type.comments.map(c => '  /// ' + c).join('\n') +
        `
  "${this.key}"${this.required() ? '' : '?'}: ${
            this.type.types.map(type => toTypeName(type)).join(' | ')};
`);
  }
}
