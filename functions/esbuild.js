const esbuild = require('esbuild');
const glob = require('glob');

// Find all .ts files in the src directory
const entryPoints = glob.sync('src/**/*.ts');

esbuild.build({
  entryPoints: entryPoints,
  platform: 'node',
  target: 'node22',
  outdir: 'lib',
  format: 'cjs',
  sourcemap: true,
}).catch(() => process.exit(1));
