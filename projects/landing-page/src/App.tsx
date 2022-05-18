import React from "react"
import {
  CssBaseline,
  ThemeProvider,
  createTheme,
  Typography,
  Box,
  Grid,
} from "@material-ui/core"
import {
  theme,
  dark,
  Loader,
  Logo,
  Sidebar,
  UIContainer,
  Section,
  SectionHeading,
  SectionText,
  SectionRef,
  FooterLink,
  SidebarLink,
  Code,
} from "./components"
import MuiAlert, { AlertProps } from "@material-ui/lab/Alert"
import { CardNetwork, CardProject } from "./components/Cards"

import Burnr from "./assets/images/Burnr.png"
import Extension from "./assets/images/Extension.png"
import YourProject from "./assets/images/YourProject.png"

const Alert = (props: AlertProps) => {
  return <MuiAlert elevation={6} variant="filled" {...props} />
}

const App: React.FunctionComponent = () => {
  return (
    <ThemeProvider theme={createTheme(theme)}>
      <CssBaseline />
      <Loader />
      <UIContainer>
        <div>
          <Section>
            <Typography variant="h1">
              Run Wasm Light Clients of any Substrate based chain directly in
              your browser
            </Typography>
          </Section>
          <Section>
            <Alert severity="warning">This project is experimental!</Alert>
          </Section>
          <Section>
            <SectionHeading id="substrate-based-chains" prefix="1">
              Substrate-based chains
            </SectionHeading>
            <SectionText>
              Substrate is a modular framework for creating use-case optimized
              blockchains at a low cost, by composing custom or pre-built
              components. Substrate is the backbone that powers Polkadot, a
              next-generation, heterogeneous, multi-chain network, and its
              ecosystem.
            </SectionText>
            <SectionRef href="https://www.substrate.io/">
              substrate.io
            </SectionRef>
            <SectionRef href="https://substrate.dev/docs/en/">
              substrate.dev/docs
            </SectionRef>
          </Section>

          <Section>
            <SectionHeading id="wasm-light-clients" prefix="2">
              Wasm Light Clients
            </SectionHeading>
            <SectionText>
              Substrate-connect turns a browser into a node on a network
              allowing end-users of Web3 apps to interact with blockchains
              directly - without connecting to third-party remote nodes and
              other servers. Removing intermediary servers between network and
              its users improves security, simplifies infrastructure of a
              network and lowers its maintenance costs. Decentralized in-browser
              light clients are a unique feature of substrate-based networks.
            </SectionText>
            <SectionRef href="https://www.parity.io/what-is-a-light-client/">
              “What is a light client and why you should care?” by Thibaut
              Sardan
            </SectionRef>
          </Section>

          <Section>
            <SectionHeading id="supported-networks" prefix="3">
              Well known Networks
            </SectionHeading>
            <Grid container>
              <CardNetwork
                title="Westend"
                statusProps={{ status: "supported" }}
                linkProps={{
                  href: "https://wiki.polkadot.network/docs/en/maintain-networks#westend-test-network",
                }}
              >
                Testing environment for Polkadot and Kusama deployments and
                processes
              </CardNetwork>
              <CardNetwork
                title="Kusama"
                statusProps={{ status: "supported" }}
                linkProps={{ href: "https://kusama.network/" }}
              >
                A network built as a risk-taking, fast-moving ‘canary in the
                coal mine’ for its cousin Polkadot
              </CardNetwork>
              <CardNetwork
                title="Polkadot"
                statusProps={{ status: "supported" }}
                linkProps={{ href: "https://polkadot.network/" }}
              >
                Scalable sharded chain and the first protocol that provides a
                secure environment for cross-chain composability
              </CardNetwork>
              <CardNetwork
                title="Rococo"
                statusProps={{ status: "supported" }}
                linkProps={{
                  href: "https://polkadot.network/rococo-v1-a-holiday-gift-to-the-polkadot-community/",
                }}
              >
                Testnet designed for parachains and related technologies:
                Cumulus and HRMP
              </CardNetwork>
            </Grid>
            <SectionRef href="https://github.com/paritytech/substrate-connect/tree/13bd26a1ca2904f8e0b5d04dfa35e82364d37d99/packages/connect/assets">
              Github repo with chainspecs
            </SectionRef>
          </Section>

          <Section>
            <SectionHeading id="getting-started" prefix="4">
              Getting Started - Usage through the PolkadotJS Provider
            </SectionHeading>
            <ThemeProvider theme={createTheme(dark)}>
              <Code>yarn add @polkadot/rpc-provider</Code>
              <Code>yarn add @polkadot/api</Code>
              <Code heading="Simple usage (suported chain)">
                <Box>{`import { ScProvider, WellKnownChain } from '@polkadot/rpc-provider/substrate-connect';`}</Box>
                <Box>{`import { ApiPromise } from '@polkadot/api';`}</Box>

                <Box mt={2}>{`// Create the provider for a known chain`}</Box>
                <Box>{`const provider = new ScProvider(WellKnownChain.westend2);`}</Box>

                <Box
                  mt={2}
                >{`// Stablish the connection (and catch possible errors)`}</Box>
                <Box>{`await provider.connect()`}</Box>

                <Box mt={2}>{`// Create the PolkadotJS api instance`}</Box>
                <Box>{`const api = await ApiPromise.create({ provider });`}</Box>

                <Box
                  mt={2}
                >{`await api.rpc.chain.subscribeNewHeads((lastHeader) => {`}</Box>
                <Box pl={3}>{`console.log(lastHeader.hash);`}</Box>
                <Box>{`);`}</Box>

                <Box>{`await api.disconnect();`}</Box>
              </Code>

              <Code heading="Simple usage (custom chain)">
                <Box>{`import { ScProvider } from '@polkadot/rpc-provider/substrate-connect';`}</Box>
                <Box>{`import { ApiPromise } from '@polkadot/api';`}</Box>
                <Box>{`import jsonCustomSpec from './jsonCustomSpec.json';`}</Box>

                <Box
                  mt={2}
                >{`// Create the provider for the custom chain`}</Box>
                <Box>{`const customSpec = JSON.stringify(jsonCustomSpec);`}</Box>
                <Box>{`const provider = new ScProvider(customSpec);`}</Box>

                <Box
                  mt={2}
                >{`// Stablish the connection (and catch possible errors)`}</Box>
                <Box>{`await provider.connect()`}</Box>

                <Box mt={2}>{`// Create the PolkadotJS api instance`}</Box>
                <Box>{`const api = await ApiPromise.create({ provider });`}</Box>

                <Box
                  mt={2}
                >{`await api.rpc.chain.subscribeNewHeads((lastHeader) => {`}</Box>
                <Box pl={3}>{`console.log(lastHeader.hash);`}</Box>
                <Box>{`);`}</Box>

                <Box>{`await api.disconnect();`}</Box>
              </Code>

              <Code heading="Parachains usage">
                <Box>{`import { ScProvider, WellKnownChain } from '@polkadot/rpc-provider/substrate-connect';`}</Box>
                <Box>{`import { ApiPromise } from '@polkadot/api';`}</Box>
                <Box>{`import jsonParachainSpec from './jsonParachainSpec.json';`}</Box>

                <Box mt={2}>{`// Create the provider for the relay chain`}</Box>
                <Box>{`const relayProvider = new ScProvider(WellKnownChain.westend2);`}</Box>

                <Box
                  mt={2}
                >{`// Create the provider for the parachain. Notice that`}</Box>
                <Box>{`// we must pass the provider of the relay chain as the`}</Box>
                <Box>{`// second argument`}</Box>
                <Box>{`const parachainSpec = JSON.stringify(jsonParachainSpec);`}</Box>
                <Box>{`const provider = new ScProvider(parachainSpec, relayProvider);`}</Box>

                <Box
                  mt={2}
                >{`// Stablish the connection (and catch possible errors)`}</Box>
                <Box>{`await provider.connect()`}</Box>

                <Box mt={2}>{`// Create the PolkadotJS api instance`}</Box>
                <Box>{`const api = await ApiPromise.create({ provider });`}</Box>

                <Box
                  mt={2}
                >{`await api.rpc.chain.subscribeNewHeads((lastHeader) => {`}</Box>
                <Box pl={3}>{`console.log(lastHeader.hash);`}</Box>
                <Box>{`);`}</Box>

                <Box>{`await api.disconnect();`}</Box>
              </Code>
            </ThemeProvider>
          </Section>
          <Section>
            <SectionHeading id="advanced-usage" prefix="5">
              Advanced usage (for library authors)
            </SectionHeading>
            <ThemeProvider theme={createTheme(dark)}>
              <Code>yarn add @substrate/connect</Code>
              <Code heading="Connecting to a `WellKnownChain`">
                <Box>{`import { WellKnownChain, createScClient } from '@substrate/connect';`}</Box>

                <Box mt={2}>{`// Create the client`}</Box>
                <Box>{`const client = createScClient();`}</Box>

                <Box
                  mt={2}
                >{`// Create the chain connection, while passing the \`jsonRpcCallback\` function. `}</Box>
                <Box>{`const chain = await client.addWellKnownChain(`}</Box>
                <Box pl={2}>{`  WellKnownChain.polkadot,`}</Box>
                <Box pl={2}>{`  function jsonRpcCallback(response) {`}</Box>
                <Box pl={4}>{`    console.log('response', response);`}</Box>
                <Box pl={2}>{`  }`}</Box>
                <Box>{`);`}</Box>

                <Box mt={2}>{`// send a RpcRequest`}</Box>
                <Box>{`chain.sendJsonRpc(`}</Box>
                <Box
                  pl={2}
                >{`  '{"jsonrpc":"2.0","id":"1","method":"system_health","params":[]}'`}</Box>
                <Box>{`);`}</Box>
              </Code>

              <Code heading="Connecting to a parachain">
                <Box>{`import { WellKnownChain, createScClient } from '@substrate/connect';`}</Box>
                <Box>{`import jsonParachainSpec from './jsonParachainSpec.json';`}</Box>

                <Box mt={2}>{`// Create the client`}</Box>
                <Box>{`const client = createScClient();`}</Box>

                <Box
                  mt={2}
                >{`// Create the relay chain connection. There is no need to pass a callback`}</Box>
                <Box>{`// function because we will sending and receiving messages through`}</Box>
                <Box>{`// the parachain connection.`}</Box>
                <Box>{`await client.addWellKnownChain(WellKnownChain.westend2);`}</Box>

                <Box mt={2}>{`// Create the parachain connection.`}</Box>
                <Box>{`const parachainSpec = JSON.stringify(jsonParachainSpec);`}</Box>
                <Box>{`const chain = await client.addChain(`}</Box>
                <Box pl={2}>{`  parachainSpec,`}</Box>
                <Box pl={2}>{`  function jsonRpcCallback(response) {`}</Box>
                <Box pl={4}>{`    console.log('response', response);`}</Box>
                <Box pl={2}>{`  }`}</Box>
                <Box>{`);`}</Box>

                <Box mt={2}>{`// send a request`}</Box>
                <Box>{`chain.sendJsonRpc(`}</Box>
                <Box
                  pl={2}
                >{`  '{"jsonrpc":"2.0","id":"1","method":"system_health","params":[]}'`}</Box>
                <Box>{`);`}</Box>
              </Code>
            </ThemeProvider>
          </Section>

          <Section>
            <SectionHeading id="api-docs" prefix="6">
              API Documentation
            </SectionHeading>
            <SectionText>
              For learning more about substrate-connect`s API and usage follow
              the link below:
            </SectionText>
            <SectionRef href="https://paritytech.github.io/substrate-connect/api/">
              Learn more
            </SectionRef>
          </Section>
          <Section>
            <SectionHeading id="extension" prefix="7">
              Browser Extension
            </SectionHeading>
            <SectionText>
              For in-browser use, Substrate Connect provides a Browser Extension
              built upon the @substrate/light node module that is running the
              selected light clients inside the extension so that the end-user
              does not need to fire up a light node in every browser tab. This
              will also allow the light-node to keep syncing as long as the
              browser window stays open.
            </SectionText>
            <CardProject
              imageProps={{
                path: Extension as string,
                position: "center center",
                fullWidth: true,
              }}
            ></CardProject>
            <SectionRef href="https://github.com/paritytech/substrate-connect/tree/main/projects/extension">
              Learn more
            </SectionRef>
            <SectionRef href="https://chrome.google.com/webstore/detail/khccbhhbocaaklceanjginbdheafklai">
              Download for Chrome
            </SectionRef>
            <SectionRef href="https://addons.mozilla.org/en-US/firefox/addon/substrate-connect/">
              Download for Firefox
            </SectionRef>
            <SectionRef href="./extension/packed-extension.zip">
              Download zip
            </SectionRef>
          </Section>
          <Section>
            <SectionHeading id="projects" prefix="8">
              Projects
            </SectionHeading>
            <CardProject
              title="Burnr"
              subtitle="Insecure redeemable wallet"
              imageProps={{ path: Burnr as string, position: "center top" }}
              linkProps={{ href: "./burnr/" }}
            />
            <CardProject
              title="Next Project"
              imageProps={{ path: YourProject as string }}
            >
              <SectionRef href="https://github.com/paritytech/substrate-connect/blob/main/CONTRIBUTING.md">
                Contributor’s guide
              </SectionRef>
            </CardProject>
          </Section>
          <ThemeProvider theme={createTheme(dark)}>
            <Section pt={5} pb={5}>
              {/* TODO: Playground */}
              <Box>
                <FooterLink href="https://parity.io/">
                  © {new Date().getFullYear()} Parity Technologies
                </FooterLink>
                <FooterLink href="https://substrate.dev/terms">
                  Terms & conditions
                </FooterLink>
                <FooterLink href="https://www.parity.io/privacy/">
                  Privacy policy
                </FooterLink>
                <FooterLink href="https://github.com/paritytech/substrate-connect/issues">
                  Report an issue
                </FooterLink>
                <FooterLink href="https://github.com/paritytech/substrate-connect">
                  GitHub
                </FooterLink>
              </Box>
            </Section>
          </ThemeProvider>
        </div>
        <Sidebar>
          <Logo />
          <SidebarLink href="#substrate-based-chains">
            Substrate-based chain
          </SidebarLink>
          <SidebarLink href="#wasm-light-clients">
            Wasm Light Clients
          </SidebarLink>
          <SidebarLink href="#supported-networks">
            Well known Networks
          </SidebarLink>
          <SidebarLink href="#getting-started">Getting Started</SidebarLink>
          <SidebarLink href="#advanced-usage">Advanced usage</SidebarLink>
          <SidebarLink href="#api-docs">API Documentation</SidebarLink>
          <SidebarLink href="#extension">Browser Extension</SidebarLink>
          <SidebarLink href="#projects">Projects</SidebarLink>
        </Sidebar>
      </UIContainer>
    </ThemeProvider>
  )
}

export default App
