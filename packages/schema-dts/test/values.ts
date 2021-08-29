import {Thing} from '../dist/schema';

// Strings & Roles work
const x1: Thing = {
  '@type': 'Person',
  knowsAbout: [
    {'@id': 'A'},
    'B',
    {'@type': 'Role', knowsAbout: {'@id': 'A'}, roleName: 'abc'},
    {'@type': 'Role', knowsAbout: 'B', roleName: 'bce'},
  ],
};

// Numbers work
const x2: Thing = {
  '@type': 'Accommodation',
  numberOfBedrooms: 5,
  numberOfBathroomsTotal: '6',
  numberOfFullBathrooms: '555.3',
};

// Numbers work in Roles
const x3: Thing = {
  '@type': 'Accommodation',
  numberOfBedrooms: {'@type': 'Role', numberOfBedrooms: 5},
  numberOfBathroomsTotal: {'@type': 'Role', numberOfBathroomsTotal: '6'},
  numberOfFullBathrooms: {'@type': 'Role', numberOfFullBathrooms: '555.3'},
};

// Numbers work in strings
const x4: Thing = {
  '@type': 'Accommodation',
  numberOfBedrooms: [5, '6', '555'],
  numberOfBathroomsTotal: ['6'],
};

// Numbers must be valid
const x5: Thing = {
  '@type': 'Accommodation',
  numberOfBedrooms: [
    5,
    // @ts-expect-error
    '6abc',
    '555',
  ],
  // @ts-expect-error
  numberOfBathroomsTotal: ['6def'],
  // @ts-expect-error
  numberOfFullBathrooms: '55ggg5.3',
};

// Roles must be valid
const x6: Thing = {
  '@type': 'Person',
  knowsAbout: [
    // @ts-expect-error
    {'@type': 'Role', knowsAbourt: {'@id': 'A'}, roleName: 'abc'},
    {
      // @ts-expect-error
      '@type': 'Role',
      // @ts-expect-error
      knowsAbout: {},
      roleName: 'bce',
    },
  ],
};
