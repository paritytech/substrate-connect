import { render } from "react-dom"
import { Options } from "./containers/Options"
import "./style.css"
import { PORTS } from "./shared"

import "@polkadot-cloud/core/accent/polkadot-relay.css"
import "@polkadot-cloud/core/theme/default/index.css"
import "@polkadot-cloud/core/css/styles/index.css"

chrome.runtime.connect({ name: PORTS.OPTIONS })

render(
  <div className="theme-polkadot-relay theme-light">
    <Options />
  </div>,
  document.getElementById("options"),
)
