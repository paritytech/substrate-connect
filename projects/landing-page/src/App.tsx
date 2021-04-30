/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React from 'react';
import { CssBaseline, ThemeProvider, createMuiTheme, Typography, Box, Grid } from '@material-ui/core';
import { theme, dark, Loader, Logo, Sidebar, UIContainer, Section, SectionHeading, SectionText, SectionHeroText, SectionRef, FooterLink, SidebarLink, Code } from './components';
import { CardNetwork, CardProject } from './components/Cards';

import BrowserDemo from 'url:../public/assets/images/BrowserDemo.png';
import NetworksDemo from 'url:../public/assets/images/NetworksDemo.png';
import Burnr from 'url:../public/assets/images/Burnr.png';
import Extension from 'url:../public/assets/images/Extension.png';
import YourProject from 'url:../public/assets/images/YourProject.png';

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
            <SectionHeading id='substrate-based-chains' prefix='1'>Substrate-based chains</SectionHeading>
            <SectionText>
              Substrate. Substrate node. Substrate is a modular framework that enables you to create purpose-built blockchains by composing custom or pre-built components.
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
              Definition. Smoldot. Warp sync. Light clients are crucial elements in blockchain ecosystems. They help users access and interact with a blockchain in a secure and decentralized manner without having to sync the full blockchain.
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
                title='Rococo'
                statusProps={{status:'very soon'}}
                linkProps={{href:'https://polkadot.network/rococo-v1-a-holiday-gift-to-the-polkadot-community/'}}
              >
                Testnet designed for parachains and related technologies: Cumulus and HRMP
              </CardNetwork>
              <CardNetwork
                title='Kusama'
                statusProps={{status:'soon'}}
                linkProps={{href:'https://kusama.network/'}}
              >
                A network built as a risk-taking, fast-moving ‘canary in the coal mine’ for its cousin Polkadot
              </CardNetwork>
              <CardNetwork
                title='Polkadot'
                statusProps={{status:'soon'}}
                linkProps={{href:'https://polkadot.network/'}}
              >
                Scalable sharded chain and the first protocol that provides a secure environment for cross-chain composability
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
                <Box>{`import { UApp } from '@substrate/connect';`}</Box>

                <Box mt={2}>{`// Create a new UApp with a unique name`}</Box>
                <Box>{`const app = new UApp('burnr-wallet');`}</Box>
                <Box>{`const westend = app.detect('westend');`}</Box>
                <Box>{`const kusama = app.detect('kusama');`}</Box>

                <Box mt={2}>{`westend.rpc.chain.subscribeNewHeads((lastHeader) => {`}</Box>
                <Box pl={3}>{`console.log(lastHeader.hash);`}</Box>
                <Box>{`);`}</Box>

                <Box mt={2}>{`kusama.rpc.chain.subscribeNewHeads((lastHeader) => {`}</Box>
                <Box pl={3}>{`console.log(lastHeader.hash);`}</Box>
                <Box>{`});`}</Box>

                <Box mt={2}>{`// etc ...`}</Box>

                <Box mt={2}>{`westend.disconnect();`}</Box>
                <Box>{`kusama.disconnect();`}</Box>
              </Code>
            </ThemeProvider>
          </Section>
          <Section>
            <SectionHeading id='projects' prefix='5'>Projects</SectionHeading>
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
              title='Extension'
              subtitle='Light clients broker for browser'
              imageProps={{path:Extension, position: 'center top'}}
              linkProps={{href:'https://github.com/paritytech/substrate-connect/tree/master/projects/extension'}}
            >
              <SectionRef href='./extension/substrate-connect.zip'>
                Download
              </SectionRef>
            </CardProject>
            <CardProject
              title='Next Project'
              imageProps={{path:YourProject}}
            >
              <SectionRef href='https://github.com/paritytech/substrate/blob/master/docs/CONTRIBUTING.adoc#rules'>
                Contributor’s guide
              </SectionRef>
            </CardProject>
          </Section>
          <ThemeProvider theme={createMuiTheme(dark)}>
            <Section pt={5} pb={5}>
              <SectionHeading id='playground' prefix='6'>Playground</SectionHeading>
              <SectionText>Save logged API as global variable. Call methods</SectionText>
              <SectionHeroText>cmd + alt + i</SectionHeroText>
              <SectionHeroText>ctrl + shift + i</SectionHeroText>
              {/* TODO: Playground */}
              <Box pt={25}>
                <FooterLink>© 2021 Parity Technologies</FooterLink>
                <FooterLink>Terms & conditions</FooterLink>
                <FooterLink>Privacy policy</FooterLink>
                <FooterLink>Report an issue</FooterLink>
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
          <SidebarLink href='#projects'>Projects</SidebarLink>
          <SidebarLink href='#playground'>Playground</SidebarLink>
        </Sidebar>
        {/* TODO: Footer */}
      </UIContainer>
    </ThemeProvider>
  );
}

export default App;
