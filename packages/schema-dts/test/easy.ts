import {Thing} from '../dist/schema';

// "@type" is required
// @ts-expect-error missing @type
const _1: Thing = {};

// "@type" can be the requested tpye
const _2: Thing = {
  '@type': 'Thing',
};

// "@type" can be a sub-type
const _3: Thing = {
  '@type': 'Person',
};

// "@type" must be valid
const _4: Thing = {
  // @ts-expect-error Invalid type
  '@type': 'Personz',
};

// A narrow "@type" allows defining sub-properties
const _5: Thing = {
  '@type': 'Person',
  name: 'a',
  additionalName: ['b', 'c', 'd'],
};

// A wide "@type" disallows valid sub-properties
// (when excess property checking is on)
const _6: Thing = {
  '@type': 'Thing',
  name: 'a',
  // @ts-expect-error Thing too broad for additionalName
  additionalName: ['b', 'c', 'd'],
};
