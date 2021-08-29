import {Graph} from '../dist/schema';

// "@context" and "@graph" are both required
// @ts-expect-error
const x1: Graph = {};

// @ts-expect-error
const x2: Graph = {'@graph': []};

// @ts-expect-error
const x3: Graph = {'@context': 'https://schema.org'};

const x4: Graph = {
  '@context': 'https://schema.org',
  '@graph': [],
};

// "@context" must be correct.
const x5: Graph = {
  // @ts-expect-error
  '@context': 'https://google.com',
  '@graph': [],
};

// "@graph" can have full objects, and types
const x6: Graph = {
  '@context': 'https://schema.org',
  '@graph': [
    {'@type': 'Thing'},
    {'@type': 'Thing', '@id': 'X'},
    {'@type': 'Person', knowsAbout: {'@id': 'X'}},
  ],
};

// "@graph" still type-checks
const x7: Graph = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Thing',
      // @ts-expect-error
      g: 5,
    },
    {
      // @ts-expect-error
      '@type': 'Thingz',
      '@id': 'X',
    },
    {'@type': 'Person', knowsAbout: {'@id': 'X'}},
  ],
};
