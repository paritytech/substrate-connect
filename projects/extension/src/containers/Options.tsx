import React, { SetStateAction, useEffect, useState } from "react"
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Badge,
  createTheme,
  ThemeProvider,
  Typography,
} from "@material-ui/core"
import { makeStyles } from "@material-ui/core/styles"
import ExpandMoreIcon from "@material-ui/icons/ExpandMore"
import Box from "@material-ui/core/Box"
import Switch from "@material-ui/core/Switch"
import FormGroup from "@material-ui/core/FormGroup"
import FormControlLabel from "@material-ui/core/FormControlLabel"
import FormControl from "@material-ui/core/FormControl"
import { light, Logo, NetworkTab } from "../components/"
import GlobalFonts from "../fonts/fonts"
import { Background } from "../background/"
import { withStyles, Theme, createStyles } from "@material-ui/core/styles"
import Tabs from "@material-ui/core/Tabs"
import Tab from "@material-ui/core/Tab"
import {
  // DEACTIVATE FOR NOW - will be n./src/containers/Options.tsx once parachains will be integrated
  //  Parachain,
  NetworkTabProps,
} from "../types"

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

interface StyledTabProps {
  label: string
}

type logStructure = {
  time: string
  level: string
  target: string
  message: string
}

const MenuTabs = withStyles({
  root: {
    minHeight: 34,
  },
})(Tabs)

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    flexBasis: "33.33%",
    flexShrink: 0,
    fontWeight: "bold",
  },
  secondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary,
  },
  logContainer: {
    maxHeight: "500px",
    overflow: "auto",
  },
}))

const MenuTab = withStyles((theme: Theme) =>
  createStyles({
    root: {
      textTransform: "none",
      minWidth: 110,
      minHeight: 34,
      marginRight: theme.spacing(3),
      color: "#BDBDBD",
      "&:hover": {
        opacity: 1,
      },
      "&$selected": {
        border: "1px solid #EEEEEE",
        borderRadius: "5px",
        color: "#000",
        backgroundColor: "#F7F7F7",
      },
    },
    selected: {},
  }),
)((props: StyledTabProps) => <Tab disableRipple {...props} />)

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box mt={4}>{children}</Box>}
    </div>
  )
}

const Options: React.FunctionComponent = () => {
  const classes = useStyles()
  const appliedTheme = createTheme(light)
  const [value, setValue] = useState<number>(0)
  const [networks, setNetworks] = useState<NetworkTabProps[]>([])
  const [notifications, setNotifications] = useState<boolean>(false)
  const [allLogs, setAllLogs] = useState<logStructure[]>([])
  const [warnLogs, setWarnLogs] = useState<logStructure[]>([])
  const [errLogs, setErrLogs] = useState<logStructure[]>([])
  const [expanded, setExpanded] = useState<string | boolean>(false)

  useEffect(() => {
    const interval = setInterval(() => {
      chrome.runtime.getBackgroundPage((bg) => {
        const logs = (bg as Background).manager.getLogger()
        setAllLogs(logs.all)
        setWarnLogs(logs.warn)
        setErrLogs(logs.error)
      })
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    chrome.storage.local.get(["notifications"], (res) => {
      setNotifications(res.notifications as SetStateAction<boolean>)
    })

    let cb: () => void = () => {}
    chrome.runtime.getBackgroundPage((backgroundPage) => {
      const bg = backgroundPage as Background
      cb = bg.manager.onManagerStateChanged((apps) => {
        const networks = new Map<string, NetworkTabProps>()
        apps.forEach((app) => {
          const network = networks.get(app.chainName)
          if (!network) {
            return networks.set(app.chainName, {
              name: app.chainName,
              health: {
                isSyncing: app.isSyncing,
                peers: app.peers,
                status: "connected",
              },
              apps: [{ name: app.url, url: app.url }],
            })
          }

          network.apps.push({ name: app.url, url: app.url })
        })
        setNetworks([...networks.values()])
      })
    })

    return () => cb()
  }, [])

  useEffect(() => {
    chrome.storage.local.set({ notifications: notifications }, () => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError)
      }
    })
  }, [notifications])

  const handleAccordionChange =
    (panel: string) =>
    (event: React.ChangeEvent<unknown>, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false)
    }

  const handleChange = (
    event: React.ChangeEvent<unknown>,
    newValue: number,
  ) => {
    setValue(newValue)
  }

  return (
    <ThemeProvider theme={appliedTheme}>
      <GlobalFonts />
      <Box pb={7}>
        <Logo />
      </Box>
      <MenuTabs
        value={value}
        onChange={handleChange}
        TabIndicatorProps={{
          style: {
            display: "none",
          },
        }}
      >
        <MenuTab label="Networks"></MenuTab>
        <MenuTab label="Settings"></MenuTab>
        <MenuTab label="Logs"></MenuTab>
      </MenuTabs>
      <TabPanel value={value} index={0}>
        {networks.length ? (
          networks.map((network: NetworkTabProps, i: number) => {
            const { name, health, apps } = network
            return (
              <NetworkTab key={i} name={name} health={health} apps={apps} />
            )
          })
        ) : (
          <div>No networks or apps are connected to the extension.</div>
        )}
      </TabPanel>
      <TabPanel value={value} index={1}>
        <FormControl component="fieldset">
          <FormGroup aria-label="position" row>
            <FormControlLabel
              value="Notifications:"
              control={
                <Switch
                  checked={notifications}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setNotifications(e.target.checked)
                  }
                  color="primary"
                  name="checkedB"
                  inputProps={{ "aria-label": "primary checkbox" }}
                />
              }
              label="Notifications:"
              labelPlacement="start"
            />
          </FormGroup>
        </FormControl>
      </TabPanel>
      <TabPanel value={value} index={2}>
        <Accordion
          expanded={expanded === "panel1"}
          onChange={handleAccordionChange("panel1")}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1bh-content"
            id="panel1bh-header"
          >
            <Typography className={classes.heading}>Errors</Typography>
            <Typography className={classes.secondaryHeading}>
              <Badge
                badgeContent={errLogs.length}
                showZero
                color="error"
              ></Badge>
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <div className={classes.logContainer}>
              {errLogs.map((res: logStructure) => {
                return (
                  <p style={{ lineHeight: "1.2rem" }}>
                    <span
                      style={{
                        fontSize: "0.8rem",
                        fontWeight: "bold",
                      }}
                    >
                      {res?.time}
                    </span>
                    <span
                      style={{
                        fontSize: "0.8rem",
                        fontStyle: "oblique",
                        margin: "0 0.5rem",
                      }}
                    >
                      {res.target}
                    </span>
                    <span>{res.message}</span>
                  </p>
                )
              })}
            </div>
          </AccordionDetails>
        </Accordion>
        <Accordion
          expanded={expanded === "panel2"}
          onChange={handleAccordionChange("panel2")}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel2bh-content"
            id="panel2bh-header"
          >
            <Typography className={classes.heading}>Warnings</Typography>
            <Typography className={classes.secondaryHeading}>
              <Badge
                badgeContent={warnLogs.length}
                showZero
                color="primary"
              ></Badge>
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <div className={classes.logContainer}>
              {warnLogs.map((res: logStructure) => {
                return (
                  <p style={{ lineHeight: "1.2rem" }}>
                    <span
                      style={{
                        fontSize: "0.8rem",
                        fontWeight: "bold",
                      }}
                    >
                      {res?.time}
                    </span>
                    <span
                      style={{
                        fontSize: "0.8rem",
                        fontStyle: "oblique",
                        margin: "0 0.5rem",
                      }}
                    >
                      {res.target}
                    </span>
                    <span>{res.message}</span>
                  </p>
                )
              })}
            </div>
          </AccordionDetails>
        </Accordion>
        <Accordion
          expanded={expanded === "panel3"}
          onChange={handleAccordionChange("panel3")}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel3bh-content"
            id="panel3bh-header"
          >
            <Typography className={classes.heading}>Logs</Typography>
            <Typography className={classes.secondaryHeading}></Typography>
          </AccordionSummary>
          <AccordionDetails>
            <div className={classes.logContainer}>
              {allLogs.map((res: logStructure) => {
                return (
                  <p style={{ lineHeight: "1.2rem" }}>
                    <span
                      style={{
                        fontSize: "0.8rem",
                        fontWeight: "bold",
                      }}
                    >
                      {res?.time}
                    </span>
                    <span
                      style={{
                        fontSize: "0.8rem",
                        fontStyle: "oblique",
                        margin: "0 0.5rem",
                      }}
                    >
                      {res.target}
                    </span>
                    <span>{res.message}</span>
                  </p>
                )
              })}
            </div>
          </AccordionDetails>
        </Accordion>
      </TabPanel>
    </ThemeProvider>
  )
}

export default Options
