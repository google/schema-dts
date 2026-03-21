import {SearchAction, WebSite, WithActionConstraints} from '../dist/schema';

// @ts-expect-error Missing '@type'
const _1: WithActionConstraints<SearchAction> = {};

const _2: SearchAction = {
  '@type': 'SearchAction',
  // @ts-expect-error 'query-input' is not defined
  'query-input': 'required name=search_term_string',
};

const _3: WithActionConstraints<SearchAction> = {
  '@type': 'SearchAction',
  'query-input': 'required name=search_term_string',
};

const _4: WithActionConstraints<SearchAction> = {
  '@type': 'SearchAction',
  // @ts-expect-error 'query-inputs' is not defined
  'query-inputs': 'required name=search_term_string',
};

const _5: WebSite = {
  '@type': 'WebSite',
  potentialAction: {
    '@type': 'SearchAction',
    'query-input': 'required name=search_term_string',
  } as WithActionConstraints<SearchAction>,
};
