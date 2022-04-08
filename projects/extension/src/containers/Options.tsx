import React, { SetStateAction, useEffect, useState } from "react"
import {
  Button,
  CircularProgress,
  createTheme,
  ThemeProvider,
} from "@material-ui/core"
import { makeStyles } from "@material-ui/core/styles"
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
import {
  PlayArrow,
  Pause as PauseIcon,
  FileCopy as FileCopyIcon,
} from "@material-ui/icons"
interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

interface StyledTabProps {
  label: string
}

interface logStructure {
  unix_timestamp: number
  level: number
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
  logs: {
    display: "block",
  },
  logContainer: {
    maxHeight: "80vh",
    overflowY: "auto",
    display: "block",
    width: "100%",
  },
  logTitle: {
    margin: "20px 0",
    display: "flex",
  },
  errCounter: {
    borderRadius: "30px",
    backgroundColor: "red",
    padding: "10px 15px",
    margin: "0 10px",
  },
  warnCounter: {
    borderRadius: "30px",
    backgroundColor: "yellow",
    padding: "10px 15px",
    margin: "0 10px",
  },
  copyClipboard: {
    margin: "0 10px",
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
  const [poolingLogs, setPoolingLogs] = useState<boolean>(true)

  const getTime = (d: number) => {
    const date = new Date(d)
    return `${("0" + date.getHours()).slice(-2)}:${(
      "0" + date.getMinutes()
    ).slice(-2)}:${("0" + date.getSeconds()).slice(-2)} ${(
      "00" + date.getMilliseconds()
    ).slice(-3)}`
  }

  const textifyLogs = () => {
    return allLogs
      .map(
        (a: logStructure) =>
          getTime(a.unix_timestamp) +
          " " +
          getLevelInfo(a.level)[0] +
          " - " +
          a.target +
          " " +
          a.message,
      )
      .join("\r\n")
  }

  useEffect(() => {
    const interval = setInterval(() => {
      if (poolingLogs) {
        chrome.runtime.getBackgroundPage((bg) => {
          const logs = (bg as Background).uiInterface.logger
          setAllLogs([...logs.all])
          setWarnLogs([...logs.warn])
          setErrLogs([...logs.error])
        })
      }
    }, 5000)
    return () => {
      clearInterval(interval)
    }
  }, [poolingLogs])

  useEffect(() => {
    chrome.storage.local.get(["notifications"], (res) => {
      setNotifications(res.notifications as SetStateAction<boolean>)
    })

    let cb: () => void = () => {}
    chrome.runtime.getBackgroundPage((backgroundPage) => {
      const bg = backgroundPage as Background
      cb = bg.uiInterface.onManagerStateChanged((apps) => {
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

  const handleChange = (
    event: React.ChangeEvent<unknown>,
    newValue: number,
  ) => {
    setValue(newValue)
  }

  const getLevelInfo = (level: number) => {
    let color: string = "#999"
    let desc: string = "Trace"
    switch (level) {
      case 0:
      case 1:
        color = "#c90a00"
        desc = "Error"
        break
      case 2:
        color = "#f99602"
        desc = "Warn"
        break
      case 3:
        color = "#000"
        desc = "Info"
        break
      case 4:
        color = "#5e5e5e"
        desc = "Debug"
        break
    }
    return [desc, color]
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
        <div className={classes.logs}>
          <div className={classes.logTitle}>
            <Button
              variant="contained"
              startIcon={poolingLogs ? <PauseIcon /> : <PlayArrow />}
              onClick={() => setPoolingLogs(!poolingLogs)}
            >
              {poolingLogs ? "Pause" : "Retrieve "} logs
            </Button>
            <Button
              className={classes.copyClipboard}
              variant="contained"
              startIcon={<FileCopyIcon />}
              onClick={() => navigator.clipboard.writeText(textifyLogs())}
            >
              Copy to clipboard
            </Button>
            <div className={classes.errCounter}>{errLogs.length} Errors</div>
            <div className={classes.warnCounter}>
              {warnLogs.length} Warnings
            </div>
          </div>
          <div className={classes.logContainer}>
            {allLogs.length > 0 ? (
              allLogs.map(
                (
                  { unix_timestamp, level, target, message }: logStructure,
                  i: number,
                ) => (
                  <p key={"all_" + i} style={{ lineHeight: "1.2rem" }}>
                    <span
                      style={{
                        color: getLevelInfo(level)[1],
                        fontSize: "0.8rem",
                        fontWeight: "bold",
                      }}
                    >
                      {getTime(unix_timestamp)}
                    </span>
                    <span
                      style={{
                        color: getLevelInfo(level)[1],
                        fontSize: "0.8rem",
                        fontWeight: "bold",
                        margin: "0 0.5rem",
                      }}
                    >
                      {getLevelInfo(level)[0]}
                    </span>
                    <span
                      style={{
                        fontSize: "0.8rem",
                        fontStyle: "oblique",
                        margin: "0 0.5rem",
                      }}
                    >
                      {target}
                    </span>
                    <span>{message}</span>
                  </p>
                ),
              )
            ) : (
              <CircularProgress />
            )}
          </div>
        </div>
      </TabPanel>
    </ThemeProvider>
  )
}

export default Options
