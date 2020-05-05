module.exports = {
  env: {
    es6: true,
    node: true,
  },
  extends: ['prettier', 'prettier/@typescript-eslint'],
  plugins: ['@typescript-eslint', 'import', 'jsdoc'],
  ignorePatterns: [],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['./src/tsconfig.json', './test/tsconfig.json'],
    sourceType: 'module',
  },
  rules: {
    '@typescript-eslint/array-type': [
      'error',
      {
        default: 'array-simple',
      },
    ],
    '@typescript-eslint/ban-types': [
      'error',
      {
        types: {
          Object: {
            message: "Use {} or 'object' instead.",
          },
          String: {
            message: "Use 'string' instead.",
          },
          Number: {
            message: "Use 'number' instead.",
          },
          Boolean: {
            message: "Use 'boolean' instead.",
          },
        },
      },
    ],
    '@typescript-eslint/class-name-casing': 'error',
    '@typescript-eslint/consistent-type-assertions': 'error',
    '@typescript-eslint/consistent-type-definitions': 'error',
    '@typescript-eslint/explicit-member-accessibility': [
      'error',
      {
        accessibility: 'no-public',
      },
    ],
    '@typescript-eslint/interface-name-prefix': 'error',
    '@typescript-eslint/member-delimiter-style': [
      'error',
      {
        multiline: {
          delimiter: 'semi',
          requireLast: true,
        },
        singleline: {
          delimiter: 'semi',
          requireLast: false,
        },
      },
    ],
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-inferrable-types': 'error',
    '@typescript-eslint/no-namespace': 'error',
    '@typescript-eslint/no-require-imports': 'error',
    '@typescript-eslint/semi': ['error', 'always'],
    '@typescript-eslint/triple-slash-reference': 'error',
    'arrow-body-style': 'error',
    camelcase: 'error',
    curly: ['error', 'multi-line'],
    'default-case': 'error',
    eqeqeq: ['error', 'smart'],
    'guard-for-in': 'error',
    'id-blacklist': [
      'error',
      'any',
      'Number',
      'number',
      'String',
      'string',
      'Boolean',
      'boolean',
      'Undefined',
    ],
    'id-match': 'error',
    'import/no-default-export': 'error',
    'jsdoc/check-alignment': 'error',
    'jsdoc/newline-after-description': 'error',
    'new-parens': 'error',
    'no-debugger': 'error',
    'no-duplicate-case': 'error',
    'no-new-wrappers': 'error',
    'no-return-await': 'error',
    'no-throw-literal': 'error',
    'no-underscore-dangle': 'error',
    'no-unsafe-finally': 'error',
    'no-unused-expressions': 'error',
    'no-unused-labels': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-arrow-callback': 'error',
    'prefer-const': 'error',
    radix: 'error',
    'use-isnan': 'error',
  },
  settings: {},
};
