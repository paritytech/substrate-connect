import React, { FunctionComponent } from "react"
import { substrateGreen } from "./theme"

export interface Props {
  size?: "small" | "medium" | "large"
  color?: string
  borderColor?: string
}

const StatusCircle: FunctionComponent<Props> = ({
  size = "medium",
  color,
  borderColor,
}: Props) => {
  const s =
    size === "small"
      ? "0.35"
      : size === "medium"
      ? "0.5"
      : size === "large"
      ? "1"
      : "0.35"

  return (
    <div
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
