# Substrate Starter UI (WIP)

A React & Typescript Starter Kit meant for rapid prototyping.

It comes with an initialized Polkadot-JS API, some example hooks, an Express server, Material UI with integrated Substrate dark and Substrate light themes and Hot Module Reloading for better prototyping.

## Environment

- React
- Webpack
- Typescript
- Express
- Polkadot JS API
- [BN.JS](bn.js)
- [Material UI React](https://material-ui.com/getting-started/installation/)
- Styled Components

## ToDo's

- [x] Add light theme
- [ ] Finalize Themes
- [x] bundle component imports
- [ ] Fetch demo info from chain
- [ ] Documentation (Where, what, how...?)
- [ ] Remove escaped characters from package.json
- [ ] Cleanup

## Quick Start

To quick start the development environment, just follow these steps:

```bash
git clone https://github.com/paritytech/substrate-connect.git
cd substrate-connect/projects/burnr
yarn install
yarn run dev
```

This will open the Starter Kit UI on [http://localhost:8000](http://localhost:8000) in HMR watch mode.

### Other commands

- `yarn run dev` - Client and server are in watch mode with source maps, opens [http://localhost:8000](http://localhost:8000)
- `yarn run test` - Runs jest tests
- `yarn run lint` - Runs es-lint
- `yarn run build` - `dist` folder will include all the needed files, both client (Bundle) and server.
- `yarn start` - Just runs `node ./dist/server/server.js`
- `yarn start:prod` - sets `NODE_ENV` to `production` and then runs `node ./dist/server/server.js`. (Bypassing webpack proxy)

## Architechture

- Separate `tsconfig.json` for client and server.
- Client and server can share code (And types)
- The client is bundled using [Webpack](https://webpack.github.io/) because it goes to the browser.
- The server is emitted by [TypeScript](https://github.com/Microsoft/TypeScript) because node 6 supports es6.

---

## Development

### Change Websocket Provider

Per default, the Starter UI connects to a remote node...
TO DO!

### Component Types

TO DO!

### React Hooks

TO DO!

### Styling

**[Theme folder](src/themes)**

TO DO!
Full list of values:
https://material-ui.com/customization/default-theme/

Material UI theming options
https://material-ui.com/customization/theming/

### Config and environment variables

All applications require a config mechanism, things that you don't want in your git history, you want a different environment to have different value (dev/staging/production). This repo uses the file `config.ts` to access all your app variables. And a `.env` file to override variable in dev environment. This file is ignored from git.

---

#### Licence

This code is released under Apache License licence.
