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
export class SchemaObject {
  readonly type = "SchemaObject";
  constructor(readonly name: string) {}

  toString() {
    return `https://schema.org/${this.name}`;
  }

  static Parse(content: string): SchemaObject | null {
    const schemaObjectResult = /^http(s?):\/\/(www\.)?schema\.org\/(.*)$/.exec(
      content
    );
    if (schemaObjectResult) {
      return new SchemaObject(schemaObjectResult[3]);
    }

    return null;
  }
}
export class SchemaSource {
  readonly type = "SchemaSource";
  constructor(readonly hash: string) {}

  toString() {
    return `http://www.w3.org/wiki/WebSchemas/SchemaDotOrgSources#${this.hash}`;
  }

  static Parse(content: string): SchemaSource | null {
    const schemaSourceResult = /^http(s?):\/\/(www\.)?w3\.org\/wiki\/WebSchemas\/SchemaDotOrgSources#(.*)$/.exec(
      content
    );
    if (schemaSourceResult) {
      return new SchemaSource(schemaSourceResult[3]);
    }
    return null;
  }
}
export class W3CNameSpaced {
  readonly type = "W3CNameSpaced";
  constructor(readonly ns: string, readonly hash: string) {}
  toString() {
    return `https://www.w3.org/ns/${this.ns}#${this.hash}`;
  }

  static Parse(content: string): W3CNameSpaced | null {
    const w3cNSResult = /^http(s?):\/\/(www\.)?w3\.org\/ns\/([^/]+)#(.*)$/.exec(
      content
    );
    if (w3cNSResult) {
      return new W3CNameSpaced(w3cNSResult[3], w3cNSResult[4]);
    }
    return null;
  }
}
export class SchemaString {
  readonly type = "SchemaString";
  constructor(readonly value: string) {}
  toString() {
    return `"${this.value}"`;
  }
  static Parse(content: string): SchemaString | null {
    const result = /^"(([^"]|(\\"))+)"$/.exec(content);
    if (result) return new SchemaString(result[1]);
    return null;
  }
}
export class RdfSyntax {
  readonly type = "RdfSntax";
  constructor(readonly date: string, readonly hash: string) {}
  toString() {
    return `http://www.w3.org/${this.date}-rdf-syntax-ns#${this.hash}`;
  }

  static Parse(content: string): RdfSyntax | null {
    const result = /^http(s?):\/\/(www\.)?w3\.org\/(\d\d\d\d\/\d\d\/\d\d)-rdf-syntax-ns#(.*)$/.exec(
      content
    );

    if (!result) return null;
    return new RdfSyntax(result[3], result[4]);
  }
}
export class RdfSchema {
  readonly type = "RdfSchema";
  constructor(readonly date: string, readonly hash: string) {}
  toString() {
    return `http://www.w3.org/${this.date}/rdf-schema#${this.hash}`;
  }
  static Parse(content: string): RdfSchema | null {
    const result = /^http(s?):\/\/(www\.)?w3\.org\/(\d\d\d\d\/\d\d)\/rdf-schema#(.*)$/.exec(
      content
    );

    if (!result) return null;
    return new RdfSchema(result[3], result[4]);
  }
}
export class W3cSkos {
  constructor(
    readonly date: string,
    readonly ns: string,
    readonly hash: string
  ) {}
  readonly type = "W3cSkos";
  toString() {
    return `http://www.w3.org/${this.date}/skos/${this.ns}/${this.hash}`;
  }
  static Parse(content: string): W3cSkos | null {
    const result = /^http(s?):\/\/(www\.)?w3\.org\/(\d\d\d\d\/\d\d)\/skos\/([^/]+)#(.*)$/.exec(
      content
    );

    if (!result) return null;
    return new W3cSkos(result[3], result[4], result[5]);
  }
}
export class WikidataConst {
  readonly type = "WikidataConst";
  constructor(readonly name: string) {}
  toString() {
    return `http://www.wikidata.org/entity/${this.name}`;
  }
  static Parse(content: string): WikidataConst | null {
    const result = /^http(s?):\/\/(www\.)?wikidata\.org\/entity\/(.*)$/.exec(
      content
    );

    if (!result) return null;
    return new WikidataConst(result[3]);
  }
}
export class Rdfs {
  readonly type = "Rdfs";
  constructor(readonly label: string) {}
  toString() {
    return `rdfs:${this.label}`;
  }
  static Parse(content: string): Rdfs | null {
    const result = /^rdfs:(.*)$/.exec(content);
    return result && new Rdfs(result[1]);
  }
}
