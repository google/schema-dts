import {Thing, WithContext} from '../dist/schema';

// "@context" and "@type" are both required
// @ts-expect-error Missing '@type' and '@context.'
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

// #98: every schema type is a union with `string`, but WithContext is only ever
// applied to a top-level object. WithContext must strip those `string` members,
// otherwise the result carries a meaningless `string & {"@context"}` branch.
type HasNoStringMember<T> = [Extract<T, string>] extends [never] ? true : false;
const _noStringBranch: HasNoStringMember<WithContext<Thing>> = true;
