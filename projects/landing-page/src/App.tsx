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

import Burnr from "url:./assets/images/Burnr.png"
import Extension from "url:./assets/images/Extension.png"
import YourProject from "url:./assets/images/YourProject.png"

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
            <SectionText>
              <div
                style={{ color: "red", fontWeight: "bold", margin: "20px 0" }}
              >
                Security Concern Note:
              </div>
              A light client only verifies the authenticity of blocks, but{" "}
              <b>NOT their correctness</b>. For this reason, the block that is
              reported as being the best block might be incorrect. In the
              context of a light client, only the finalised block can be assumed
              to be correct. Consequently, accessing the storage of any
              non-finalised block is also not guaranteed to report correct
              values.
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
              Getting Started
            </SectionHeading>
            <ThemeProvider theme={createTheme(dark)}>
              <Code>yarn add @substrate/substrate-connect</Code>
              <Code heading="Simple usage (suported chain)">
                <Box>{`import { createPolkadotJsScClient, WellKnownChain } from '@substrate/connect';`}</Box>

                <Box mt={2}>{`// Create a client for our App`}</Box>
                <Box>{`const scClient = createPolkadotJsScClient();`}</Box>

                <Box mt={2}>{`// Create providers for known chains`}</Box>
                <Box>{`const westendProvider = await scClient.addWellKnownChain(WellKnownChain.westend2);`}</Box>
                <Box>{`const api1 = await ApiPromise.create({ provider: westendProvider });`}</Box>
                <Box>{`const kusamaProvider = await scClient.addWellKnownChain(WellKnownChain.ksmcc3);`}</Box>
                <Box>{`const api2 = await ApiPromise.create({ provider: kusamaProvider });`}</Box>

                <Box
                  mt={2}
                >{`await api1.rpc.chain.subscribeNewHeads((lastHeader) => {`}</Box>
                <Box pl={3}>{`console.log(lastHeader.hash);`}</Box>
                <Box>{`);`}</Box>

                <Box
                  mt={2}
                >{`await api2.rpc.chain.subscribeNewHeads((lastHeader) => {`}</Box>
                <Box pl={3}>{`console.log(lastHeader.hash);`}</Box>
                <Box>{`});`}</Box>

                <Box mt={2}>{`// etc ...`}</Box>

                <Box mt={2}>{`await api1.disconnect();`}</Box>
                <Box>{`await api2.disconnect();`}</Box>
              </Code>

              <Code heading="Simple usage (custom chain)">
                <Box>{`import { createPolkadotJsScClient } from '@substrate/connect';`}</Box>
                <Box>{`import customSpecs from './customSpecs.json';`}</Box>

                <Box>{`const scClient = createPolkadotJsScClient();`}</Box>
                <Box
                  mt={2}
                >{`await scClient.addWellKnownChain(WellKnownChain.westend2);`}</Box>
                <Box>{`const myChain = await scClient.addChain(JSON.stringify(customSpecs));`}</Box>
                <Box>{`const api = await ApiPromise.create({ provider: myChain });`}</Box>

                <Box
                  mt={2}
                >{`await api.rpc.chain.subscribeNewHeads((lastHeader) => {`}</Box>
                <Box pl={3}>{`console.log(lastHeader.hash);`}</Box>
                <Box>{`);`}</Box>
                <Box mt={2}>{`await myChain.disconnect();`}</Box>
              </Code>

              <Code heading="Simple usage with options">
                <Box>{`import { createPolkadotJsScClient, WellKnownChain } from '@substrate/connect';`}</Box>
                <Box>{`const scClient = createPolkadotJsScClient();`}</Box>
                <Box
                  mt={2}
                >{`const provider = await scClient.addWellKnownChain(WellKnownChain.westend2);`}</Box>
                <Box>{`const apiOptions = {types: customTypes}`}</Box>
                <Box>{`const api = await ApiPromise.create({ provider, options: apiOptions });`}</Box>
                <Box
                  mt={2}
                >{`await api.rpc.chain.subscribeNewHeads((lastHeader) => {`}</Box>
                <Box pl={3}>{`console.log(lastHeader.hash);`}</Box>
                <Box>{`);`}</Box>
                <Box mt={2}>{`await api.disconnect();`}</Box>
              </Code>

              <Code heading="Parachains usage">
                <Box>{`import { createPolkadotJsScClient, WellKnownChain } from '@substrate/connect';`}</Box>
                <Box>{`import parachainSpecs from from './parachainSpecs.json';`}</Box>

                <Box>{`const scClient = createPolkadotJsScClient();`}</Box>
                <Box
                  mt={2}
                >{`await scClient.addWellKnownChain(WellKnownChain.westend2);`}</Box>
                <Box>{`const provider = await scClient.addChain(JSON.stringify(parachainSpecs));`}</Box>
                <Box>{`const api = await ApiPromise.create({ provider });`}</Box>

                <Box
                  mt={2}
                >{`await api.rpc.chain.subscribeNewHeads((lastHeader) => {`}</Box>
                <Box pl={3}>{`console.log(lastHeader.hash);`}</Box>
                <Box>{`);`}</Box>

                <Box mt={2}>{`await api.disconnect();`}</Box>
              </Code>

              <Code heading="Parachains usage with options">
                <Box>{`import { createPolkadotJsScClient, WellKnownChain } from '@substrate/connect';`}</Box>
                <Box>{`import parachainSpecs from from './parachainSpecs.json';`}</Box>

                <Box>{`const scClient = createPolkadotJsScClient();`}</Box>
                <Box
                  mt={2}
                >{`await scClient.addWellKnownChain(WellKnownChain.westend2);`}</Box>
                <Box>{`const provider = await scClient.addChain(JSON.stringify(parachainSpecs));`}</Box>
                <Box>{`const apiOptions = {types: customTypes}`}</Box>
                <Box>{`const api = await ApiPromise.create({ provider, options: apiOptions });`}</Box>

                <Box
                  mt={2}
                >{`await api.rpc.chain.subscribeNewHeads((lastHeader) => {`}</Box>
                <Box pl={3}>{`console.log(lastHeader.hash);`}</Box>
                <Box>{`);`}</Box>

                <Box mt={2}>{`await api.disconnect();`}</Box>
              </Code>
            </ThemeProvider>
          </Section>
          <Section>
            <SectionHeading id="api-docs" prefix="5">
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
            <SectionHeading id="extension" prefix="6">
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
            <SectionRef href="./extension/substrate-connect.zip">
              Download zip
            </SectionRef>
          </Section>
          <Section>
            <SectionHeading id="projects" prefix="7">
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
          <SidebarLink href="#api-docs">API Documentation</SidebarLink>
          <SidebarLink href="#extension">Browser Extension</SidebarLink>
          <SidebarLink href="#projects">Projects</SidebarLink>
        </Sidebar>
        {/* TODO: Footer */}
      </UIContainer>
    </ThemeProvider>
  )
}

export default App
