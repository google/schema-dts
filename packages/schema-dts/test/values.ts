import {Thing} from '../dist/schema';

// Strings & Roles work
const _1: Thing = {
  '@type': 'Person',
  knowsAbout: [
    {'@id': 'A'},
    'B',
    {'@type': 'Role', knowsAbout: {'@id': 'A'}, roleName: 'abc'},
    {'@type': 'Role', knowsAbout: 'B', roleName: 'bce'},
  ],
};

// Numbers work
const _2: Thing = {
  '@type': 'Accommodation',
  numberOfBedrooms: 5,
  numberOfBathroomsTotal: '6',
  numberOfFullBathrooms: '555.3',
};

// Numbers work in Roles
const _3: Thing = {
  '@type': 'Accommodation',
  numberOfBedrooms: {'@type': 'Role', numberOfBedrooms: 5},
  numberOfBathroomsTotal: {'@type': 'Role', numberOfBathroomsTotal: '6'},
  numberOfFullBathrooms: {'@type': 'Role', numberOfFullBathrooms: '555.3'},
};

// Numbers work in strings
const _4: Thing = {
  '@type': 'Accommodation',
  numberOfBedrooms: [5, '6', '555'],
  numberOfBathroomsTotal: ['6'],
};

// Numbers must be valid
const _5: Thing = {
  '@type': 'Accommodation',
  numberOfBedrooms: [
    5,
    // @ts-expect-error Invalid number
    '6abc',
    '555',
  ],
  // @ts-expect-error Invalid number in array
  numberOfBathroomsTotal: ['6def'],
  // @ts-expect-error Invalid number
  numberOfFullBathrooms: '55ggg5.3',
};

// Roles must be valid
const _6: Thing = {
  '@type': 'Person',
  knowsAbout: [
    // @ts-expect-error Invalid role
    {'@type': 'Role', knowsAbourt: {'@id': 'A'}, roleName: 'abc'},
    // @ts-expect-error Invalid role
    {
      '@type': 'Role',
      knowsAbout: {},
      roleName: 'bce',
    },
  ],
};
