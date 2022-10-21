import React, { FunctionComponent } from "react"
import "../main.css"

interface Props {
  isWellKnown?: boolean
  children?: string
}

// Only the 4 well-known chains should ever have icons. It is not the responsibility of this
// source code to maintain a list of active chains and their icons.
const hasGlyph = (string: string) =>
  ["kusama", "polkadot", "westend", "rococo"].indexOf(string) > -1

export const IconWeb3: FunctionComponent<Props> = ({
  children,
  isWellKnown,
}) => {
  return (
    <span className="icon text-xl w-10">
      {isWellKnown && children && hasGlyph(children) ? children : "?"}
    </span>
  )
}
