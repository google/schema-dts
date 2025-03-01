import jsdoc from 'eslint-plugin-jsdoc';
import importPlugin from 'eslint-plugin-import';
import prettierConfig from 'eslint-config-prettier';
import stylistic from '@stylistic/eslint-plugin';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  tseslint.configs.recommendedTypeChecked,
  prettierConfig,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: [import.meta.dirname],
      },
    },
  },
  {
    files: ['**/*.ts'],
    plugins: {jsdoc, import: importPlugin, '@stylistic': stylistic},
    rules: {
      '@typescript-eslint/array-type': [
        'error',
        {
          default: 'array-simple',
        },
      ],
      '@typescript-eslint/no-restricted-types': [
        'error',
        {
          types: {
            Object: {
              fixWith: 'object',
            },
            String: {
              fixWith: 'string',
            },
            Number: {
              fixWith: 'number',
            },
            Boolean: {
              fixWith: 'boolean',
            },
          },
        },
      ],
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'default',
          format: ['camelCase'],
          leadingUnderscore: 'allow',
          trailingUnderscore: 'allow',
        },
        {
          selector: 'variable',
          format: ['PascalCase', 'camelCase', 'UPPER_CASE'],
          modifiers: ['const'],
          leadingUnderscore: 'allow',
          trailingUnderscore: 'allow',
        },
        {
          selector: 'variableLike',
          format: ['PascalCase', 'camelCase'],
          filter: {regex: '^_$', match: false},
        },
        {
          selector: 'memberLike',
          format: ['camelCase', 'PascalCase'],
        },
        {
          selector: 'memberLike',
          modifiers: ['private'],
          format: ['camelCase', 'PascalCase'],
          leadingUnderscore: 'allow',
        },
        {
          selector: 'typeLike',
          format: ['PascalCase'],
        },
        {
          selector: ['typeProperty', 'objectLiteralProperty'],
          format: null,
        },
      ],
      '@typescript-eslint/consistent-type-assertions': 'error',
      '@typescript-eslint/consistent-type-definitions': 'error',
      '@typescript-eslint/explicit-member-accessibility': [
        'error',
        {
          accessibility: 'no-public',
        },
      ],
      '@stylistic/member-delimiter-style': [
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
      '@typescript-eslint/no-unused-expressions': [
        'error',
        {allowShortCircuit: true},
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      '@typescript-eslint/triple-slash-reference': 'error',
      '@stylistic/semi': ['error', 'always'],
      'arrow-body-style': 'error',
      curly: ['error', 'multi-line'],
      'default-case': 'error',
      eqeqeq: ['error', 'smart'],
      'guard-for-in': 'error',
      'id-denylist': [
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
      'new-parens': 'error',
      'no-debugger': 'error',
      'no-duplicate-case': 'error',
      'no-new-wrappers': 'error',
      'no-return-await': 'error',
      'no-throw-literal': 'error',
      'no-underscore-dangle': 'off',
      'no-unsafe-finally': 'error',
      'no-unused-expressions': ['error', {allowShortCircuit: true}],
      'no-unused-labels': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',
      'prefer-arrow-callback': 'error',
      'prefer-const': 'error',
      radix: 'error',
      'use-isnan': 'error',
    },
    settings: {},
  },
);
