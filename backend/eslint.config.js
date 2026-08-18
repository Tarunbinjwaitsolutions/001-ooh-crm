import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },

  /**
   * RULE 1 — no cross-module imports.
   * A module never reaches into another module's model or internals. Talk to the
   * other module through its exported service:
   *   import { leadService } from '../leads/leads.service.js';   ✗ from inside another module
   *   const lead = await leadService.getById(id, ctx);           ✓
   */
  {
    files: ['src/modules/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/modules/*/**'],
              message:
                'No cross-module imports. Import the other module\'s exported service only (see README).',
            },
          ],
        },
      ],
    },
  },

  /**
   * RULE 2 — no raw queries in controllers or routes.
   * Reads go through the scoping layer in the service: scopedFind(Model, filter, ctx).
   */
  {
    files: ['src/modules/**/*.controller.ts', 'src/modules/**/*.routes.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "CallExpression[callee.property.name=/^(find|findOne|findById|countDocuments|aggregate)$/]",
          message:
            'No database calls in controllers. Move the query into the service and use scopedFind().',
        },
      ],
    },
  },
);
