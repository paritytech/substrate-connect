/* eslint-disable @typescript-eslint/no-unsafe-call */
import React, { FunctionComponent, SetStateAction, Dispatch } from "react"
import {
  Typography,
  Box,
  IconButton,
  createStyles,
  makeStyles,
} from "@material-ui/core"
import BlockIcon from "@material-ui/icons/Block"
import Zoom from "@material-ui/core/Zoom"
import Tooltip, { TooltipProps } from "@material-ui/core/Tooltip"
import { grey } from "@material-ui/core/colors"
import { IconWeb3 } from "."
import { TabInterface } from "../types"

interface TabProps {
  disconnectTab: (tabId: number) => void
  current?: boolean
  tab?: TabInterface
  setActiveTab?: Dispatch<SetStateAction<TabInterface | undefined>>
}

const useStylesBootstrap = makeStyles((theme) => ({
  arrow: {
    color: theme.palette.common.black,
  },
  tooltip: {
    backgroundColor: theme.palette.common.black,
    fontSize: 14,
  },
}))

const useStyles = makeStyles((theme) =>
  createStyles({
    disableButton: {
      color: theme.palette.text.hint,
      marginLeft: theme.spacing(),
      "&:not(:hover)": {
        opacity: 0.2,
      },
      "& svg": {
        fontSize: "0.8rem",
      },
    },
  }),
)

const BootstrapTooltip = (props: TooltipProps) => {
  const classes = useStylesBootstrap()
  return <Tooltip arrow classes={classes} {...props} />
}

const Tab: FunctionComponent<TabProps> = ({
  disconnectTab,
  tab,
  current = false,
  setActiveTab,
}) => {
  const classes = useStyles()
  /**
   * If Tab that initiated this function has a tabId (check for validity) then disconnectTab
   * function will be called to disconnect the tab. At the same time, in case the tan is marked as current
   * (meaning opened at the same window) - it is ensured that it will be removed from UI through passing setActiveTab
   * Dispatcher.
   **/
  const onDisconnect = (): void => {
    if (tab && tab.tabId) {
      /* TODO(nik): Fix smoldot definition (see: https://github.com/paritytech/substrate-connect/blob/3350cdff9c4c294393160189816168a93c983f79/projects/extension/src/background/ConnectionManager.ts#L202)
       ** eslint disable below seems to be due to smoldot definition */
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      disconnectTab(tab.tabId)
      if (setActiveTab && current) {
        setActiveTab(undefined)
      }
    }
  }

  return (
    <Box
      pt={current ? 1.25 : 0.5}
      pb={current ? 1.25 : 0.5}
      pr={1}
      pl={1}
      style={!tab ? { height: "10px" } : {}}
    >
      <Box display="flex" alignItems="center" justifyContent="space-between">
        {tab && (
          <>
            <Typography noWrap variant={current ? "h3" : "h4"}>
              {tab.url}
            </Typography>
            <Box display="flex" alignItems="center">
              {tab?.networks.map((n) => (
                <IconWeb3 key={n} size="14px" color={grey[800]}>
                  {n}
                </IconWeb3>
              ))}
              <IconButton
                onClick={onDisconnect}
                size="small"
                className={classes.disableButton}
              >
                {/* TODO: Disconnect should be replacesd with Block/Unblock once functionality is implemented */}
                <BootstrapTooltip
                  title={"Disconnect this app"}
                  TransitionComponent={Zoom}
                  placement={"top"}
                >
                  <BlockIcon />
                </BootstrapTooltip>
              </IconButton>
            </Box>
          </>
        )}
      </Box>
    </Box>
  )
}

export default Tab
