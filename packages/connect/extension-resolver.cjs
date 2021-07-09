let defaultResolver;

function requireDefaultResolver() {
  if (!defaultResolver) {
    try {
      defaultResolver = import (`jest-resolve/build/defaultResolver`);
    } catch (error) {
      defaultResolver = import (`jest-resolve/build/default_resolver`);
    }
  }

  return defaultResolver;
}


module.exports = (request, options) => {
  const {basedir, defaultResolver, extensions} = options;

  if (!defaultResolver) {
    defaultResolver = requireDefaultResolver();
  }

  try {
    return defaultResolver(request, options);
  } catch (e) {
    console.log(`${e} - Temporary replace extension '.js' to '.ts' for tests to run.\n`)
    return defaultResolver(request.replace(/\.js$/, '.ts'), options);
  }
}