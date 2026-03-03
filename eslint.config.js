let customConfig = [];
let hasIgnoresFile = false;
try {
  require.resolve('./eslint.ignores.js');
  hasIgnoresFile = true;
} catch {
  // eslint.ignores.js doesn't exist
}

if (hasIgnoresFile) {
  const ignores = require('./eslint.ignores.js');
  customConfig = [{ignores}];
}

const gtsConfig = require('gts');

// Override parserOptions for app files to use tsconfig.app.json
const appOverride = {
  files: ['src/**/*.ts'],
  ignores: ['src/**/*.spec.ts'],
  languageOptions: {
    parserOptions: {
      project: './tsconfig.app.json',
    },
  },
};

// Override parserOptions for spec files to use tsconfig.spec.json
const specsOverride = {
  files: ['**/*.spec.ts'],
  languageOptions: {
    parserOptions: {
      project: './tsconfig.spec.json',
    },
  },
};

module.exports = [...customConfig, ...gtsConfig, appOverride, specsOverride];
