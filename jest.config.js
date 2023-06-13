module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testRegex: './tests/.*\\.test\\.ts?$',
  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  maxConcurrency: 1
};
