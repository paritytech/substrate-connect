// These options are here to force typescript-eslint to understand our project
// references and solve the problem of the types for connect-extension-protocol
// not being available when you try to lint this project before you have built
// connect-extension-protocol.
//
// Project references are not officially supported yet:
// https://github.com/typescript-eslint/typescript-eslint/issues/2094 
//
// Adding the tsconfigs for dependent projects into parserOptions.project is 
// *supposed* to work but doesn't.
//
// Someone from the community found a way to make it work (with a performance
// hit) with moderately sized mono repos and added the EXPERIMENTAL_ flag which
// I use below:
//
// https://github.com/typescript-eslint/typescript-eslint/issues/2094#issuecomment-707270558
// https://github.com/typescript-eslint/typescript-eslint/pull/2669/
module.exports = {
  parserOptions: {
    EXPERIMENTAL_useSourceOfProjectReferenceRedirect: true,
    project: [
      "../connect-extension-protocol/tsconfig.json",
      "./tsconfig.json"
    ]
  }
};
