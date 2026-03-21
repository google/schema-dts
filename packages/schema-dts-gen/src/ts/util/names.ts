/**
 * Copyright 2023 Google LLC
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

import type {NamedNode} from 'n3';
import {Context} from '../context.js';

function decodeIfPossible(component: string) {
  try {
    return decodeURIComponent(component);
  } catch {
    return component;
  }
}

function unURLify(url: URL): string {
  if (url.hash) {
    return url.host + url.pathname + url.hash;
  }
  return url.host + url.pathname;
}

function unURLifyIfNecessary(name: string): string {
  try {
    return unURLify(new URL(name));
  } catch {
    return name;
  }
}

export function toClassName(subject: NamedNode, context: Context): string {
  let scopedName = context.getScopedName(subject);
  if (scopedName === subject.id) {
    scopedName = unURLifyIfNecessary(scopedName);
  }
  let sanitizedName = decodeIfPossible(scopedName).replace(
    /[^A-Za-z0-9_]/g,
    '_',
  );

  // No leading numbers.
  if (/^[0-9]/g.test(sanitizedName)) {
    sanitizedName = `_${sanitizedName}`;
  }

  return sanitizedName;
}
