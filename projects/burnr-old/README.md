# Substrate Connect Burnr Wallet

A light-client-based, in-browser wallet for Substrate. It's meant to be quick and easy to use but less secure than other solutions.

### @TODO
Try out  https://github.com/tylervipond/use-as-bind hook

## Quick Start

To quick start the development environment, just follow these steps:

```bash
git clone https://github.com/paritytech/substrate-connect.git
cd substrate-connect/projects/burnr
yarn install
yarn run dev
```

This will open the Burnr Wallet on [http://localhost:8000](http://localhost:8000) in HMR watch mode.

### Other commands

- `yarn run dev` - Client and server are in watch mode with source maps, opens [http://localhost:8000](http://localhost:8000)
- `yarn run lint` - Runs es-lint
- `yarn run build` - `dist` folder will include all the needed files, both client (Bundle) and server.
- `yarn start` - Just runs `node ./dist/server/server.js`
- `yarn start:prod` - sets `NODE_ENV` to `production` and then runs `node ./dist/server/server.js`. (Bypassing webpack proxy)

#### Licence

This code is released under Apache License licence.
