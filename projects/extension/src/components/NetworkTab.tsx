import React, { FunctionComponent, useState } from "react"
import { IconWeb3, StatusCircle } from "."
import {
  withStyles,
  makeStyles,
  Theme,
  createStyles,
} from "@material-ui/core/styles"
import MuiAccordion from "@material-ui/core/Accordion"
import MuiAccordionSummary from "@material-ui/core/AccordionSummary"
import MuiAccordionDetails from "@material-ui/core/AccordionDetails"
import Typography from "@material-ui/core/Typography"
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown"

import { NetworkTabProps, App, OptionsNetworkTabHealthContent } from "../types"
import { Box, Grid } from "@material-ui/core"

export const emojis = {
  chain: "🔗",
  tick: "✅",
  info: "ℹ️",
  deal: "🤝",
  chequeredFlag: "🏁",
  star: "✨",
  clock: "🕒",
  apps: "📺",
  seedling: "🌱",
}

const Accordion = withStyles((theme) => ({
  root: {
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: "none",
    "&:not(:last-child)": {
      borderBottom: 0,
    },
    "&:before": {
      display: "none",
    },
    "&$expanded": {
      margin: "auto",
    },
  },
}))(MuiAccordion)

const AccordionSummary = withStyles({
  root: {
    minHeight: 48,
    "&$expanded": {
      minHeight: 48,
    },
  },
  content: {
    justifyContent: "space-between",
    alignItems: "center",
    "&$expanded": {
      margin: "12px 0",
    },
  },
  expanded: {},
})(MuiAccordionSummary)

const AccordionDetails = withStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
    borderBottomLeftRadius: theme.spacing(),
    borderBottomRightRadius: theme.spacing(),
    backgroundColor: theme.palette.text.primary,
    color: theme.palette.divider,
  },
}))(MuiAccordionDetails)

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: "100%",
      maxWidth: 640,
      marginBottom: theme.spacing(),
      display: "flex",
    },
    onlineIconBox: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: 48,
      height: 48,
    },
    accordion: {
      width: "100%",
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: theme.spacing(),
    },
  }),
)

interface NetworkContentProps {
  health: OptionsNetworkTabHealthContent
  apps: App[]
  network: string
}

const NetworkContent = ({ network, health, apps }: NetworkContentProps) => {
  return (
    <Typography variant="subtitle2" component="div">
      <Grid container>
        <Grid item xs={3}>
          {emojis.seedling} Light Client
        </Grid>
        <Grid item xs={9}>
          {health.isSyncing ? "Synchronizing" : "Synchronized"}
        </Grid>
        <Grid item xs={3}>
          {emojis.star} Network
        </Grid>
        <Grid item xs={9}>
          {network}
          <br /> Chain is {health.status}
        </Grid>
        <Grid item xs={3}>
          {emojis.deal} Peers
        </Grid>
        <Grid item xs={9}>
          {health.peers}
        </Grid>
        <Grid item xs={3}>
          {emojis.apps} Apps
        </Grid>
        <Grid item xs={9}>
          {apps.length}:
        </Grid>
        <Grid item xs={3}></Grid>
        <Grid item xs={9}>
          {apps.map((app) => (
            <Grid key={app.url} container>
              {app.url}
            </Grid>
          ))}
        </Grid>
      </Grid>
    </Typography>
  )
}

const NetworkTab: FunctionComponent<NetworkTabProps> = ({
  name,
  health,
  apps,
}: NetworkTabProps) => {
  const classes = useStyles()
  const [expanded, setExpanded] = useState<boolean>(false)

  return (
    <div className={classes.root}>
      <div className={classes.onlineIconBox}>
        <StatusCircle
          size="medium"
          color={
            health && health.status === "connected" ? "#16DB9A" : "transparent"
          }
        />
      </div>
      <Accordion
        TransitionProps={{ unmountOnExit: true }}
        className={classes.accordion}
        elevation={0}
        onChange={() => setExpanded(!expanded)}
        expanded={expanded}
      >
        <AccordionSummary expandIcon={<ArrowDropDownIcon color="secondary" />}>
          <Box display="flex">
            <IconWeb3 size={"20px"}>{name}</IconWeb3>
            <Typography variant="h2">{name}</Typography>
          </Box>
          <Typography variant="body2">
            Peer{health && health.peers === 1 ? "" : "s"}:{" "}
            {(health && health.peers) ?? ".."}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <NetworkContent health={health} apps={apps} network={name} />
        </AccordionDetails>
      </Accordion>
    </div>
  )
}

export default NetworkTab
