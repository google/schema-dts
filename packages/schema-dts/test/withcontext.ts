import {Thing, WithContext} from '../dist/schema';

// "@context" and "@type" are both required
// @ts-expect-error
const x1: WithContext<Thing> = {};

// @ts-expect-error
const x2: WithContext<Thing> = {'@type': 'Thing'};

// @ts-expect-error
const x3: WithContext<Thing> = {'@context': 'https://schema.org'};

const x4: WithContext<Thing> = {
  '@context': 'https://schema.org',
  '@type': 'Thing',
};

// "@context" must be correct.
const x5: WithContext<Thing> = {
  // @ts-expect-error
  '@context': 'https://google.com',
  // XXX: KNOWN ISSUE: (minor devx) This should not be an error, but it is.
  // @ts-ignore
  '@type': 'Thing',
};
