import React, { FunctionComponent } from "react"
import { makeStyles, Theme } from "@material-ui/core"
interface Props {
  size?: string
  color?: string
  children?: string
}

const useStyles = makeStyles<Theme, Props>({
  iconRoot: {
    display: "inline-block",
    fontFamily: "Web3-Regular !important",
    letterSpacing: "0 !important",
    textAlign: "center",
    color: ({ color }) => color || "inherit",
    fontSize: ({ size }) => size || "inherit",
    fontWeight: 400,
  },
})

const hasGlyph = (string: string) =>
  ["kusama", "polkadot", "westend", "rococo"].indexOf(string) > -1

const IconWeb3: FunctionComponent<Props> = ({ size, color, children }) => {
  const classes = useStyles({ size, color })
  return (
    <span className={classes.iconRoot}>
      {children && hasGlyph(children) ? children : "?"}
    </span>
  )
}

export default IconWeb3
