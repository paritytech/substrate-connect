/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React from 'react';
import { CssBaseline, ThemeProvider, createMuiTheme, Typography, Box, Grid } from '@material-ui/core';
import { theme, dark, Loader, Logo, Sidebar, UIContainer, Section, SectionHeading, SectionText, SectionRef, FooterLink, SidebarLink, Code } from './components';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';
import { CardNetwork, CardProject } from './components/Cards';

import BrowserDemo from 'url:../public/assets/images/BrowserDemo.png';
import NetworksDemo from 'url:../public/assets/images/NetworksDemo.png';
import Burnr from 'url:../public/assets/images/Burnr.png';
import Extension from 'url:../public/assets/images/Extension.png';
import YourProject from 'url:../public/assets/images/YourProject.png';

const Alert = (props: AlertProps) => {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const App: React.FunctionComponent = () => {
  return (
    <ThemeProvider theme={createMuiTheme(theme)}>
      <CssBaseline />
      <Loader />
      <UIContainer>
        <div>
          <Section>
            <Typography variant='h1'>
              Run Wasm Light Clients of any Substrate based chain directly in your browser
            </Typography>
          </Section>
          <Section>
            <Alert severity="warning">This project is experimental!</Alert>
          </Section>
          <Section>
            <SectionHeading id='substrate-based-chains' prefix='1'>Substrate-based chains</SectionHeading>
            <SectionText>
              Substrate is a modular framework for creating use-case optimized blockchains at a low cost, by composing custom or pre-built components. Substrate is the backbone that powers Polkadot, a next-generation, heterogeneous, multi-chain network, and its ecosystem.
            </SectionText>
            <SectionRef href='https://www.substrate.io/'>
              substrate.io
            </SectionRef>
            <SectionRef href='https://substrate.dev/docs/en/'>
              substrate.dev/docs
            </SectionRef>
          </Section>
          
          <Section>
            <SectionHeading id='wasm-light-clients' prefix='2'>Wasm Light Clients</SectionHeading>
            <SectionText>
              Substrate-connect turns a browser into a node on a network allowing end-users of Web3 apps to interact with blockchains directly - without connecting to third-party remote nodes and other servers. Removing intermediary servers between network and its users improves security, simplifies infrastructure of a network and lowers its maintenance costs. Decentralized in-browser light clients are a unique feature of substrate-based networks.
            </SectionText>
            <SectionRef href='https://www.parity.io/what-is-a-light-client/'>
              “What is a light client and why you should care?” by Thibaut Sardan
            </SectionRef>
          </Section>

          <Section>
            <SectionHeading id='supported-networks' prefix='3'>Supported Networks</SectionHeading>
            <Grid container>
              <CardNetwork
                title='Westend'
                statusProps={{status:'supported'}}
                linkProps={{href:'https://wiki.polkadot.network/docs/en/maintain-networks#westend-test-network'}}
              >
                Testing environment for Polkadot and Kusama deployments and processes
              </CardNetwork>
              <CardNetwork
                title='Kusama'
                statusProps={{status:'supported'}}
                linkProps={{href:'https://kusama.network/'}}
              >
                A network built as a risk-taking, fast-moving ‘canary in the coal mine’ for its cousin Polkadot
              </CardNetwork>
              <CardNetwork
                title='Polkadot'
                statusProps={{status:'supported'}}
                linkProps={{href:'https://polkadot.network/'}}
              >
                Scalable sharded chain and the first protocol that provides a secure environment for cross-chain composability
              </CardNetwork>
              <CardNetwork
                title='Rococo'
                statusProps={{status:'soon'}}
                linkProps={{href:'https://polkadot.network/rococo-v1-a-holiday-gift-to-the-polkadot-community/'}}
              >
                Testnet designed for parachains and related technologies: Cumulus and HRMP
              </CardNetwork>
            </Grid>
            <SectionRef href='https://github.com/paritytech/substrate-connect/tree/13bd26a1ca2904f8e0b5d04dfa35e82364d37d99/packages/connect/assets'>
              Github repo with chainspecs
            </SectionRef>
          </Section>

          <Section>
            <SectionHeading id='getting-started' prefix='4'>Getting Started</SectionHeading>
            <ThemeProvider theme={createMuiTheme(dark)}>
              <Code>
                yarn add @substrate/substrate-connect
              </Code>
              <Code heading='index.ts'>
                <Box>{`import { Detector } from '@substrate/connect';`}</Box>

                <Box mt={2}>{`// Create a new UApp with a unique name`}</Box>
                <Box>{`const app = new Detector('burnr-wallet');`}</Box>
                <Box>{`const westend = await app.connect('westend');`}</Box>
                <Box>{`const kusama = await app.connect('kusama');`}</Box>

                <Box mt={2}>{`await westend.rpc.chain.subscribeNewHeads((lastHeader) => {`}</Box>
                <Box pl={3}>{`console.log(lastHeader.hash);`}</Box>
                <Box>{`);`}</Box>

                <Box mt={2}>{`await kusama.rpc.chain.subscribeNewHeads((lastHeader) => {`}</Box>
                <Box pl={3}>{`console.log(lastHeader.hash);`}</Box>
                <Box>{`});`}</Box>

                <Box mt={2}>{`// etc ...`}</Box>

                <Box mt={2}>{`await westend.disconnect();`}</Box>
                <Box>{`await kusama.disconnect();`}</Box>
              </Code>
            </ThemeProvider>
          </Section>
          <Section>
            <SectionHeading id='api-docs' prefix='5'>API Documentation</SectionHeading>
            <SectionText>For learning more about substrate-connect`s API and usage follow the link below:</SectionText>
            <SectionRef href='https://paritytech.github.io/substrate-connect/api/'>Learn more</SectionRef>
          </Section>
          <Section>
            <SectionHeading id='extension' prefix='6'>Browser Extension</SectionHeading>
            <SectionText>For in-browser use, Substrate Connect provides a Browser Extension built upon the @substrate/light node module that is running the selected light clients inside the extension so that the end-user does not need to fire up a light node in every browser tab. This will also allow the light-node to keep syncing as long as the browser window stays open.</SectionText>
            <CardProject
              imageProps={{path: Extension, position: 'center center', fullWidth: true}}
            >
            </CardProject>
            <SectionRef href='https://github.com/paritytech/substrate-connect/tree/master/projects/extension'>Learn more</SectionRef>
            {/* Deactivate straight download for now 
              <SectionRef href='./extension/substrate-connect.zip'>Download</SectionRef> 
            */}
          </Section>
          <Section>
            <SectionHeading id='projects' prefix='7'>Projects</SectionHeading>
            <CardProject
              title='Browser Demo'
              subtitle='Minimal implementation'
              imageProps={{path:BrowserDemo, position: 'left top'}}
              linkProps={{href:'./smoldot-browser-demo/'}}
            />
            <CardProject
              title='Burnr'
              subtitle='Insecure redeemable wallet'
              imageProps={{path:Burnr, position: 'center top'}}
              linkProps={{href:'./burnr/'}}
            />
            <CardProject
              title='Multi Network Demo'
              subtitle='One uApp - multiple networks implementation'
              imageProps={{path:NetworksDemo, position: 'center top'}}
              linkProps={{href:'./multiple-network-demo/'}}
            />
            <CardProject
              title='Next Project'
              imageProps={{path:YourProject}}
            >
              <SectionRef href='https://github.com/paritytech/substrate-connect/blob/master/CONTRIBUTING.md'>
                Contributor’s guide
              </SectionRef>
            </CardProject>
          </Section>
          <ThemeProvider theme={createMuiTheme(dark)}>
            <Section pt={5} pb={5}>
              {/* TODO: Playground */}
              <Box>
                <FooterLink href='https://parity.io/'>© 2021 Parity Technologies</FooterLink>
                <FooterLink href='https://substrate.dev/terms'>Terms & conditions</FooterLink>
                <FooterLink href='https://www.parity.io/privacy/'>Privacy policy</FooterLink>
                <FooterLink href='https://github.com/paritytech/substrate-connect/issues'>Report an issue</FooterLink>
                <FooterLink href='https://github.com/paritytech/substrate-connect'>GitHub</FooterLink>
              </Box>
            </Section>
          </ThemeProvider>
        </div>
        <Sidebar>
          <Logo />
          <SidebarLink href='#substrate-based-chains'>Substrate-based chain</SidebarLink>
          <SidebarLink href='#wasm-light-clients'>Wasm Light Clients</SidebarLink>
          <SidebarLink href='#supported-networks'>Supported Networks</SidebarLink>
          <SidebarLink href='#getting-started'>Getting Started</SidebarLink>
          <SidebarLink href='#api-docs'>API Documentation</SidebarLink>
          <SidebarLink href='#extension'>Browser Extension</SidebarLink>
          <SidebarLink href='#projects'>Projects</SidebarLink>
        </Sidebar>
        {/* TODO: Footer */}
      </UIContainer>
    </ThemeProvider>
  );
}

export default App;
