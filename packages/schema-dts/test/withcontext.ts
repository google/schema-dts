import {Thing, WithContext} from '../dist/schema';

// "@context" and "@type" are both required
// @ts-expect-error Missing '@type' and '@contet.'
const _1: WithContext<Thing> = {};

// @ts-expect-error Missing '@context'
const _2: WithContext<Thing> = {'@type': 'Thing'};

// @ts-expect-error Missing '@type'
const _3: WithContext<Thing> = {'@context': 'https://schema.org'};

const _4: WithContext<Thing> = {
  '@context': 'https://schema.org',
  '@type': 'Thing',
};

// "@context" must be correct.
const _5: WithContext<Thing> = {
  // @ts-expect-error Must be schema.org
  '@context': 'https://google.com',
  '@type': 'Thing',
};
