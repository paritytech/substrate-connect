import React from 'react';
import { CssBaseline, ThemeProvider, createMuiTheme, Typography, Link, Box } from '@material-ui/core';
import { theme, dark, Loader, Logo, Sidebar, UIContainer, Section, SectionHeading, SectionText, SectionRef, FooterLink } from './components';

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
            <SectionHeading prefix='1'>Substrate-based chains</SectionHeading>
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
            <SectionHeading prefix='2'>Wasm Light Clients</SectionHeading>
            <SectionText>
              Definition. Smoldot. Warp sync. Light clients are crucial elements in blockchain ecosystems. They help users access and interact with a blockchain in a secure and decentralized manner without having to sync the full blockchain.
            </SectionText>
            <SectionRef href='https://www.parity.io/what-is-a-light-client/'>
              “What is a light client and why you should care?” by Thibaut Sardan
            </SectionRef>
          </Section>

          <Section>
            <SectionHeading prefix='3'>Supported Networks</SectionHeading>
            {/* TODO: Cards */}
            <SectionRef href='https://github.com/paritytech/substrate-connect/tree/13bd26a1ca2904f8e0b5d04dfa35e82364d37d99/packages/connect/assets'>
              Github repo with chainspecs
            </SectionRef>
          </Section>

          <Section>
            <SectionHeading prefix='4'>Getting Started</SectionHeading>
            {/* TODO: CodeSnippet */}
          </Section>
          <Section>
            <SectionHeading prefix='5'>Projects</SectionHeading>
            {/* TODO: ProjectCard */}
          </Section>
          <ThemeProvider theme={createMuiTheme(dark)}>
            <Section pt={5} pb={5}>
              <SectionHeading prefix='6'>Playground</SectionHeading>
              <SectionText>Save logged API as global variable. Call methods</SectionText>
              <Box pt={25}>
                <FooterLink>© 2021 Parity Technologies</FooterLink>
                <FooterLink>Terms & conditions</FooterLink>
                <FooterLink>Privacy policy</FooterLink>
                <FooterLink>Report an issue</FooterLink>
                <FooterLink href='https://github.com/paritytech/substrate-connect'>GitHub</FooterLink>
              </Box>
              {/* TODO: Playground */}
            </Section>
          </ThemeProvider>
        </div>
        <Sidebar>
          <Logo />
          <ul>
            <li>Substrate-based chain</li>
            <li>Light Clients</li>
            <li>Supported Networks</li>
            <li>Getting Starter</li>
            <li>Projects</li>
            <li>Playground</li>
            <li>Github Repository</li>
          </ul>
        </Sidebar>
        {/* TODO: Footer */}
      </UIContainer>
    </ThemeProvider>
  );
}

export default App;
