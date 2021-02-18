module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    settings: {
        react: {
          version: 'detect',
        },
    },
    plugins: [
      '@typescript-eslint',
    ],
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
    ],
    env: {
        node: true,
    },
};