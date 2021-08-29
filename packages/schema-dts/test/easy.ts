import {Thing} from '../dist/schema';

// "@type" is required
// @ts-expect-error
const x1: Thing = {};

// "@type" can be the requested tpye
const x2: Thing = {
  '@type': 'Thing',
};

// "@type" can be a sub-type
const x3: Thing = {
  '@type': 'Person',
};

// "@type" must be valid
const x4: Thing = {
  // @ts-expect-error
  '@type': 'Personz',
};

// A narrow "@type" allows defining sub-properties
const x5: Thing = {
  '@type': 'Person',
  name: 'a',
  additionalName: ['b', 'c', 'd'],
};

// A wide "@type" disallows valid sub-properties
// (when excess property checking is on)
const x6: Thing = {
  '@type': 'Thing',
  name: 'a',
  // @ts-expect-error
  additionalName: ['b', 'c', 'd'],
};
