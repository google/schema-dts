module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*_test.[jt]s?(x)'],
  testPathIgnorePatterns: ['/node_modules/', '/built/', '/dist/'],
  collectCoverage: true,
  coveragePathIgnorePatterns: ['/node_modules/', '/built/', '/dist/']
};