export default {
  preset: 'ts-jest/presets/default-esm', // or other ESM presets
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  testEnvironment: 'node',
  testMatch: ['**/*_test.[jt]s?(x)'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  collectCoverage: true,
  coveragePathIgnorePatterns: ['/node_modules/', '/dist/'],
  // We don't need this because we use Coveralls 'base-dir'
  // coverageReporters: ['json', ['lcov', {projectRoot: '../../'}], 'text'],
};
