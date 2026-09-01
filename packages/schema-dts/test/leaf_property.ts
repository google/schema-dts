import type {OrganizationLeaf} from '../dist/schema';

// A property's type can be extracted from the concrete leaf interface. Indexing
// the union alias `Organization` instead would fail, because that alias also
// includes an id-reference `string` with no properties.
type OrgImage = OrganizationLeaf['image'];
type OrgName = OrganizationLeaf['name'];

const _image: OrgImage = 'https://acme.com/logo.png';

const _name: OrgName = 'Acme Corp';

// The extracted type still rejects invalid values.
// @ts-expect-error image is not a number.
const _bad: OrgImage = 42;
