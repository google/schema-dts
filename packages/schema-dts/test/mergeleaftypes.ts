import {
  MergeLeafTypes,
  Product,
  ProductLeaf,
  SoftwareApplicationLeaf,
  WithContext,
} from '../dist/schema';

const _1: WithContext<MergeLeafTypes<[ProductLeaf, SoftwareApplicationLeaf]>> =
  {
    '@context': 'https://schema.org',
    '@type': ['Product', 'SoftwareApplication'],
    name: 'My App',
    offers: {
      '@type': 'Offer',
      price: 89,
      priceCurrency: 'USD',
    },
    operatingSystem: 'Any',
  };

const _2: WithContext<MergeLeafTypes<[ProductLeaf]>> = {
  '@context': 'https://schema.org',
  '@type': ['Product'],
  name: 'Single Product',
};

const _3: MergeLeafTypes<[ProductLeaf, SoftwareApplicationLeaf]>['@type'] = [
  'Product',
  'SoftwareApplication',
];

const _4: MergeLeafTypes<[ProductLeaf, SoftwareApplicationLeaf]>['@type'] = [
  // @ts-expect-error MergeLeafTypes preserves tuple ordering.
  'SoftwareApplication',
  // @ts-expect-error MergeLeafTypes preserves tuple ordering.
  'Product',
];

const _5: WithContext<MergeLeafTypes<[ProductLeaf, SoftwareApplicationLeaf]>> =
  {
    '@context': 'https://schema.org',
    '@type': ['Product', 'SoftwareApplication'],
    name: 'My App',
    // @ts-expect-error Invalid property
    invalidProp: 'xyz',
  };

// @ts-expect-error MergeLeafTypes expects concrete leaf types, not unions.
const _6: WithContext<MergeLeafTypes<[Product, SoftwareApplicationLeaf]>> = {
  '@context': 'https://schema.org',
  '@type': ['Product', 'SoftwareApplication'],
};
