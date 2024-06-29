import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import stylisticPlugin from '@stylistic/eslint-plugin'

export default tseslint.config(
    {
        ignores: [
            '.next/',
            'eslint.config.mjs',
            'next.config.mjs',
        ]
    },
    eslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,
    {
        languageOptions: { 
            parserOptions: {
                project: 'tsconfig.json',
                tsconfigRootDir: import.meta.dirname
            }
        },
        rules: {
            '@typescript-eslint/consistent-type-imports': 'error',
            '@typescript-eslint/explicit-function-return-type': 'error',
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': ['error', {
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^_',
                caughtErrorsIgnorePattern: '^_'
            }]
        }
    },
    {
        plugins: {
            'react-hooks': reactHooksPlugin,
            '@stylistic': stylisticPlugin,
            import: importPlugin,
        },
        rules: {
            ...reactHooksPlugin.configs.recommended.rules,
            ...stylisticPlugin.configs['recommended-flat'].rules,
            '@stylistic/indent': ['error', 4, { SwitchCase: 1 }],
            '@stylistic/comma-dangle': ['error', 'never'],
            '@stylistic/line-comment-position': ['error', { position: 'above' }],
            '@stylistic/multiline-comment-style': ['error', 'separate-lines'],
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
    },
);
