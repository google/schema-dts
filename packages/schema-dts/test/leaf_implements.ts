import type {PersonLeaf} from '../dist/schema';

// A class can `implements` the concrete leaf interface, which the union alias
// `Person` (a discriminated union that also includes `string`) does not allow.
class Employee implements PersonLeaf {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  readonly '@type' = 'Person';
  name: string;

  constructor(name: string) {
    this.name = name;
  }
}

const _1: PersonLeaf = new Employee('Ada');

// The leaf interface pins `@type` to a single literal.
const _2: PersonLeaf = {
  // @ts-expect-error '@type' must be the "Person" literal.
  '@type': 'Organization',
};

// Leaf properties still accept valid Schema.org values.
const _3: PersonLeaf = {
  '@type': 'Person',
  name: 'Ada Lovelace',
};
