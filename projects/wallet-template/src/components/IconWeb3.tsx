import { FunctionComponent } from "react"
import { MdOutlineGridView } from "react-icons/md"
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
    <>
      {isWellKnown && children && hasGlyph(children) ? (
        <span className="flex items-center text-xl icon">{children}</span>
      ) : (
        <MdOutlineGridView />
      )}
    </>
  )
}
