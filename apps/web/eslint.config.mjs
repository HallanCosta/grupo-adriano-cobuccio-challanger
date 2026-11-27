import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import unicorn from 'eslint-plugin-unicorn';
import unusedImports from 'eslint-plugin-unused-imports';

const NO_INLINE_JSX_HANDLER = {
  selector:
    'JSXAttribute[name.name=/^on[A-Z]/] > JSXExpressionContainer > :matches(ArrowFunctionExpression, FunctionExpression)',
  message:
    'Extraia o handler para uma função com nome (ex.: const handleClick = ...) em vez de escrever direto no JSX.',
};

const NO_CLASSES = {
  selector:
    'ClassDeclaration[superClass.name!="Error"], ClassExpression[superClass.name!="Error"]',
  message: 'Sem classes, exceto erros que estendem Error.',
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: {
      'unused-imports': unusedImports,
      unicorn,
    },
    linterOptions: { reportUnusedDisableDirectives: 'error' },
    rules: {
      'no-undef': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrors: 'none',
          ignoreRestSiblings: true,
        },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { fixStyle: 'inline-type-imports', disallowTypeAnnotations: false },
      ],
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'func-style': ['error', 'expression'],
      'react/function-component-definition': [
        'error',
        { namedComponents: 'arrow-function', unnamedComponents: 'arrow-function' },
      ],
      'react/no-array-index-key': 'error',
      'no-restricted-syntax': ['error', NO_INLINE_JSX_HANDLER, NO_CLASSES],
      'max-lines': ['warn', { max: 300, skipBlankLines: true, skipComments: true }],
      'unicorn/filename-case': ['error', { case: 'camelCase' }],
    },
  },
  {
    files: [
      'src/app/page.tsx',
      'src/app/layout.tsx',
      'src/app/**/page.tsx',
      'src/app/**/layout.tsx',
    ],
    rules: {
      'func-style': 'off',
      'react/function-component-definition': 'off',
    },
  },
  {
    files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}', '**/test/**'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-restricted-syntax': 'off',
      'max-lines': 'off',
      'no-console': 'off',
      'react/function-component-definition': 'off',
      'func-style': 'off',
    },
  },
]);

export default eslintConfig;
