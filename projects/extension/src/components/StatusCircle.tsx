import React, { FunctionComponent } from "react"
import { substrateGreen } from "./theme"

export interface Props {
  size?: "s" | "sm" | "m" | "ml" | "l"
  color?: string
  borderColor?: string
}

const StatusCircle: FunctionComponent<Props> = ({
  size = "m",
  color,
  borderColor,
}: Props) => {
  let s: string

  switch (size) {
    case "s":
      s = "0.1"
      break
    case "sm":
      s = "0.25"
      break
    case "m":
      s = "0.5"
      break
    case "ml":
      s = "0.75"
      break
    case "l":
      s = "1"
      break
  }

  return (
    <section
      data-testid="circle"
      style={{
        width: s.concat("rem"),
        height: s.concat("rem"),
        borderRadius: s.concat("rem"),
        backgroundColor: `${color || substrateGreen[400]}`,
        border: `1px solid ${borderColor || substrateGreen[400]}`,
      }}
    />
  )
}

export default StatusCircle
