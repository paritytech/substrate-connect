// This code was adapted from https://github.com/AyogoHealth/jest-ts-webcompat-resolver
// Original code was MIT Licensed: https://opensource.org/licenses/MIT
// Original author: Darryl Pogue <darryl@dpogue.ca>
// Original copyright 2019 Ayogo Health Inc.
let defaultResolver;

function requireDefaultResolver() {
  return import (`jest-resolve/build/defaultResolver`);
}

module.exports = (request, options) => {
  const {basedir, defaultResolver, extensions} = options;

  if (!defaultResolver) {
    defaultResolver = requireDefaultResolver();
  }

  try {
    return defaultResolver(request, options);
  } catch (err) {
    if (
      // We should not try to fix issues of other packages
      !err.message.includes('node_modules') &&
      request.endsWith('.js') && // make sure that the file ends with .js
      err.code === 'MODULE_NOT_FOUND' // make sure error code is specific
    ) {
      try {
        console.log(`Temporary replace extension '.js' to '.ts' for tests to run.\n`)
        return defaultResolver(request.replace(/\.js$/, '.ts'), options);  
      } catch (e) {
        console.error(`Errored resolving a module after replacing js extension with ts.${err.message}\n`);
        console.error(`${e}`);
      }
    }
    throw e;
  }
}
