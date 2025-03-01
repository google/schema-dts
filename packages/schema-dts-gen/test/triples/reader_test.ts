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
import {jest} from '@jest/globals';
import type {Mock, SpiedFunction} from 'jest-mock';

import {ClientRequest, IncomingMessage} from 'http';
import https from 'https';
import {PassThrough, Writable} from 'stream';

import fs from 'fs/promises';
import {load, loadFile} from '../../src/triples/reader.js';

import {flush} from '../helpers/async.js';
import {Literal, NamedNode, Quad, Store} from 'n3';

describe('load', () => {
  let get: Mock<typeof https.get>;
  let ogGet: (typeof https)['get'];

  beforeEach(() => {
    get = jest.fn();
    ogGet = https.get;
    https.get = get as (typeof https)['get'];
  });
  afterEach(() => {
    https.get = ogGet;
  });

  it('total fail', async () => {
    const firstReturn = passThrough();
    get.mockReturnValueOnce(firstReturn);
    firstReturn.destroy(new Error('Bad!!!'));

    await expect(load('https://schema.org/')).rejects.toThrow('Bad!!!');

    expect(get).toBeCalledTimes(1);
  });

  describe('with one or more message', () => {
    let store: Promise<Store>;
    let fakeResponse: FakeResponseFunc;

    beforeEach(async () => {
      get.mockImplementationOnce((_, cb) => {
        // Unfortunately, we use another overload that doesn't appear here.
        const callback = cb as unknown as (inc: IncomingMessage) => void;
        fakeResponse = makeFakeResponse(callback);

        return passThrough();
      });

      // toPromise makes Observables un-lazy, so we can just go ahead.
      store = load('https://schema.org/');

      await flush();
    });

    it('METATEST', () => {
      // Make sure our test machinery works. If the METATEST fails, then
      // the test code itself broke.
      expect(get).toBeCalled();
      expect(store).not.toBeUndefined();
      expect(fakeResponse).toBeInstanceOf(Function);
    });

    it('First response fails at status', async () => {
      fakeResponse(500, 'So Sad!');

      await expect(store).rejects.toThrow('So Sad!');
    });

    it('First response fails at error', async () => {
      const control = fakeResponse(200, 'Ok');
      control.error('So BAD!');

      await expect(store).rejects.toThrow('So BAD!');
    });

    it('Immediate success (empty)', async () => {
      const control = fakeResponse(200, 'Ok');
      control.end();

      expect((await store).size).toEqual(0);
    });

    it('Oneshot', async () => {
      const control = fakeResponse(200, 'Ok');
      control.data(
        `<https://schema.org/Person> <https://schema.org/knowsAbout> "math" .\n`,
      );
      control.end();

      expect((await store).size).toEqual(1);
      expect((await store).getQuads(null, null, null, null)).toEqual([
        new Quad(
          new NamedNode('https://schema.org/Person'),
          new NamedNode('https://schema.org/knowsAbout'),
          new Literal('"math"'),
        ),
      ]);
    });

    it('Multiple (clean broken)', async () => {
      const control = fakeResponse(200, 'Ok');
      control.data(
        `<https://schema.org/Person> <https://schema.org/knowsAbout> "math" .\n`,
      );
      control.data(
        `<https://schema.org/Person> <https://schema.org/knowsAbout> "science" .\n`,
      );
      control.end();

      expect((await store).size).toEqual(2);
    });

    it('Multiple (works with unnamed URL: subject)', async () => {
      const control = fakeResponse(200, 'Ok');
      control.data(
        `<https://schema.org/Person> <https://schema.org/knowsAbout> "math" .\n`,
      );
      control.data(
        `<http://schema.org/> <http://www.w3.org/2000/01/rdf-schema#comment> "A test comment." .\n`,
      );
      control.end();

      expect((await store).size).toEqual(2);
      expect((await store).getQuads(null, null, null, null)).toEqual([
        new Quad(
          new NamedNode('https://schema.org/Person'),
          new NamedNode('https://schema.org/knowsAbout'),
          new Literal('"math"'),
        ),
        new Quad(
          new NamedNode('http://schema.org/'),
          new NamedNode('http://www.w3.org/2000/01/rdf-schema#comment'),
          new Literal('"A test comment."'),
        ),
      ]);
    });

    it('Multiple (works with search URL)', async () => {
      const control = fakeResponse(200, 'Ok');
      control.data(
        `<https://schema.org/Person> <https://schema.org/knowsAbout> "math" .\n`,
      );
      control.data(
        `<https://schema.org/X?A=B> <http://www.w3.org/2000/01/rdf-schema#comment> "A test comment." .\n`,
      );
      control.end();

      expect((await store).getQuads(null, null, null, null)).toEqual([
        new Quad(
          new NamedNode('https://schema.org/Person'),
          new NamedNode('https://schema.org/knowsAbout'),
          new Literal('"math"'),
        ),
        new Quad(
          new NamedNode('https://schema.org/X?A=B'),
          new NamedNode('http://www.w3.org/2000/01/rdf-schema#comment'),
          new Literal('"A test comment."'),
        ),
      ]);
    });

    it('Multiple (works with unnamed URL: predicate)', async () => {
      const control = fakeResponse(200, 'Ok');
      control.data(
        `<https://schema.org/Person> <https://schema.org/knowsAbout> "math" .\n`,
      );
      control.data(
        `<http://schema.org/A> <https://schema.org> "A test comment." .\n`,
      );
      control.end();

      expect((await store).size).toEqual(2);
    });

    it('Multiple (dirty broken)', async () => {
      const control = fakeResponse(200, 'Ok');
      control.data(`<https://schema.org/Person> <https://sc`);
      control.data(
        `hema.org/knowsAbout> "math" .\n<https://schema.org/Person> <https://schema.org/knowsAbout> "science" .\n`,
      );
      control.end();

      expect((await store).getQuads(null, null, null, null)).toEqual([
        new Quad(
          new NamedNode('https://schema.org/Person'),
          new NamedNode('https://schema.org/knowsAbout'),
          new Literal('"math"'),
        ),
        new Quad(
          new NamedNode('https://schema.org/Person'),
          new NamedNode('https://schema.org/knowsAbout'),
          new Literal('"science"'),
        ),
      ]);
    });

    it('Skips local files', async () => {
      const control = fakeResponse(200, 'Ok');
      control.data(`<https://schema.org/Person> <https://sc`);
      control.data(
        `hema.org/knowsAbout> "math" .\n<file:///usr/Person> <https://schema.org/knowsAbout> "science" .\n`,
      );
      control.end();

      expect((await store).size).toEqual(1);
    });

    describe('.nt syntax errors', () => {
      it('partially missing', async () => {
        const control = fakeResponse(200, 'Ok');
        control.data(`<https://schema.org/knowsAbout> <https://sc`);
        control.end();
        await expect(store).rejects.toThrow();
      });

      it('only two datums', async () => {
        const control = fakeResponse(200, 'Ok');
        control.data(`<https://schema.org/knowsAbout> <https://sc> .`);
        control.end();
        await expect(store).rejects.toThrow();
      });

      it('missing dot', async () => {
        const control = fakeResponse(200, 'Ok');
        control.data(
          `<https://schema.org/knowsAbout> <https://scema.org/domainIncludes> "a"`,
        );
        control.end();
        await expect(store).rejects.toThrow();
      });

      it('Non-IRI Subject', async () => {
        const control = fakeResponse(200, 'Ok');
        control.data(`"knowsAbout" <https://scema.org/domainIncludes> "a" .`);
        control.end();
        await expect(store).rejects.toThrow();
      });

      it('Non-IRI Predicate', async () => {
        const control = fakeResponse(200, 'Ok');
        control.data(`<https://schema.org/knowsAbout> "domainIncludes" "a"`);
        control.end();
        await expect(store).rejects.toThrow();
      });

      it('Invalid object', async () => {
        const control = fakeResponse(200, 'Ok');
        control.data(`<https://schema.org/a> <https://schema.org/b> 'c`);
        control.end();
        await expect(store).rejects.toThrow();
      });

      it('Domain only', async () => {
        const control = fakeResponse(200, 'Ok');
        control.data(`<https://schema.org/> <https://schema.org/b> "c"`);
        control.end();
        await expect(store).rejects.toThrow();
      });
    });

    describe('redirects', () => {
      let fakeResponse2: FakeResponseFunc;

      beforeEach(async () => {
        // on second call:
        get.mockImplementationOnce((_, cb) => {
          // Unfortunately, we use another overload that doesn't appear here.
          const callback = cb as unknown as (inc: IncomingMessage) => void;
          fakeResponse2 = makeFakeResponse(callback);

          return passThrough();
        });

        fakeResponse(302, 'Redirect', {
          location: 'https://schema.org/6.0/all-layers.nt',
        });
        await flush();
      });

      it('METATEST', () => {
        expect(fakeResponse2).toBeInstanceOf(Function);
      });

      it('Post Redirect response fails at status', async () => {
        fakeResponse2(500, 'So Sad!');

        await expect(store).rejects.toThrow('So Sad!');
      });

      it('Post Redirect response fails at error', async () => {
        const control = fakeResponse2(200, 'Ok');
        control.error('So BAD!');

        await expect(store).rejects.toThrow('So BAD!');
      });

      it('Post Redirect (empty)', async () => {
        const control = fakeResponse2(200, 'Ok');
        control.end();

        expect((await store).size).toEqual(0);
      });

      it('Post Redirect Oneshot', async () => {
        const control = fakeResponse2(200, 'Ok');
        control.data(
          `<https://schema.org/Person> <https://schema.org/knowsAbout> "math" .\n`,
        );
        control.end();

        expect((await store).size).toEqual(1);
      });

      it('Post Redirect Multiple (clean broken)', async () => {
        const control = fakeResponse2(200, 'Ok');
        control.data(
          `<https://schema.org/Person> <https://schema.org/knowsAbout> "math" .\n`,
        );
        control.data(
          `<https://schema.org/Person> <https://schema.org/knowsAbout> "science" .\n`,
        );
        control.end();

        expect((await store).size).toEqual(2);
      });

      it('Post Redirect Multiple (dirty broken)', async () => {
        const control = fakeResponse2(200, 'Ok');
        control.data(`<https://schema.org/Person> <https://sc`);
        control.data(
          `hema.org/knowsAbout> "math" .\n<https://schema.org/Person> <https://schema.org/knowsAbout> "science" .\n`,
        );
        control.end();

        expect((await store).size).toEqual(2);
      });
    });
    describe('local file', () => {
      let readFileFn: SpiedFunction<(typeof fs)['readFile']>;
      beforeEach(() => {
        const mockFileLine = `<https://schema.org/Person> <https://schema.org/knowsAbout> <https://schema.org/Event> .\n`;
        readFileFn = jest
          .spyOn(fs, 'readFile')
          .mockImplementation(_ => Promise.resolve(mockFileLine));
      });
      it('fails loading a file (containing .nt syntax errors)', async () => {
        const failingMockPath = './bad-ontology.nt';
        const failingMockLine = `<https://schema.org/knowsAbout> <https://sc`;
        readFileFn.mockImplementation(_ => Promise.resolve(failingMockLine));

        const fileTriples = loadFile(failingMockPath);
        await expect(fileTriples).rejects.toThrow('Unexpected');
      });
      it('loads a file from the correct path', async () => {
        const mockFilePath = './ontology.nt';

        const fileStore = loadFile(mockFilePath);

        expect((await fileStore).getQuads(null, null, null, null)).toEqual([
          new Quad(
            new NamedNode('https://schema.org/Person'),
            new NamedNode('https://schema.org/knowsAbout'),
            new NamedNode('https://schema.org/Event'),
          ),
        ]);
      });
    });
  });
});

function passThrough(): ClientRequest {
  return new PassThrough() as Writable as ClientRequest;
}

interface Control {
  data(s: string): void;
  end(): void;
  error(s: string): void;
}
type Headers =
  | {
      location: string;
    }
  | {'content-location': string}
  | undefined;

type FakeResponseFunc = (
  statusCode: number,
  statusMessage: string,
  headers?: Headers,
) => Control;

function makeFakeResponse(
  callback: (inc: IncomingMessage) => void,
): FakeResponseFunc {
  return (statusCode: number, statusMessage: string, headers?: Headers) => {
    interface CBs {
      data: (b: Buffer) => void;
      end: () => void;
      error: (error: Error) => void;
    }

    const cbs: CBs = {} as CBs;
    const message = {
      statusCode,
      statusMessage,
      headers: headers || {},
      on(event: string, cb: (...args: unknown[]) => void): void {
        if (event === 'data') cbs['data'] = cb;
        if (event === 'end') cbs['end'] = cb;
        if (event === 'error') cbs['error'] = cb;
      },
    } as IncomingMessage;
    callback(message);

    const control = {
      data(s: string) {
        const buffer = Buffer.from(s, 'utf-8');
        void flush().then(() => cbs['data'](buffer));
      },
      end() {
        void flush().then(() => cbs['end']());
      },
      error(e: string) {
        const error = new Error(e);
        void flush().then(() => cbs['error'](error));
      },
    };
    return control;
  };
}
