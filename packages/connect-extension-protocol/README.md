# @substrate/connect-extension-protocol

This is a module consisting (almost) only of types.  These types are the types
of the messages passed between apps using `@substrate/connect` and the browser
extension.  The package is shared between `@substrate/connect` and the
extension.  It exports wrappers to the `window.postMessage` API to be used on
either side of the communication to have the typescript compiler enforce the
contract between them.

## Making and publishing

If you make changes to this package.  You **must** publish this package to npm
before publishing `@substrate/connect` or the extension.
