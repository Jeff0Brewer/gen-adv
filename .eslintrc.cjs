module.exports = {
    root: true,
    env: { browser: true, es2020: true },
    extends: [
        'next/core-web-vitals',
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:react-hooks/recommended',
        'plugin:import/recommended',
        'standard'
    ],
    ignorePatterns: ['dist'],
    parser: '@typescript-eslint/parser',
    plugins: ['react-refresh'],
    rules: {
        '@typescript-eslint/consistent-type-imports': 'error',
        '@typescript-eslint/explicit-function-return-type': 'error',
        indent: ['error', 4, { SwitchCase: 1 }],
        'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': ['error', {
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_',
            caughtErrorsIgnorePattern: '^_'
        }],
        'sort-imports': [
            'error',
            {
                ignoreDeclarationSort: true,
                memberSyntaxSortOrder: ['none', 'all', 'single', 'multiple']
            }
        ],
        'import/order': [
            'error',
            {
                groups: [
                    'type',
                    'builtin',
                    'external',
                    'internal',
                    'parent',
                    'sibling',
                    'index',
                    'object'
                ],
                'newlines-between': 'never',
                alphabetize: {
                    order: 'asc'
                }
            }
        ]
    }
}
