import React from 'react';
import { createMuiTheme, ThemeProvider, Grid } from '@material-ui/core';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import GlobalFonts from '../assets/fonts/fonts';
import { light, PolkaFont, AntSwitch } from '../components';

  const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
        width: '240px',
        margin: '10px'
    },
  }),
);

const Popup: React.FunctionComponent = () => {
    const appliedTheme = createMuiTheme(light);
    const classes = useStyles();
	return (
        <ThemeProvider theme={appliedTheme}>
            <GlobalFonts />
            <div className={classes.root}>
                <Grid
                    container
                    justify='space-between'
                    alignItems='center'
                    style={{ margin: '15px 0'}}>
                        <h2 style={{ margin: '0' }}>Burnr</h2>
                        <AntSwitch
                            />
                </Grid>
                <Grid item xs={12}>
                    <div>is connected to <PolkaFont>polkadot</PolkaFont> and <PolkaFont>kusama</PolkaFont></div>
                </Grid>
                <Grid item xs={12}>
                    <div  style={{
                        height: '300px'
                    }}>Popup Main page alallalal polkadot kusama</div>
                    <PolkaFont size={'60'}>polkadot kusama</PolkaFont>
                </Grid>
            </div>
        </ThemeProvider>
	);
};

export default Popup;
