import { render } from "react-dom"
import { Popup } from "./containers/Popup"
import "./style.css"
import { PORTS } from "./shared"

import "@polkadot-cloud/core/accent/polkadot-relay.css"
import "@polkadot-cloud/core/theme/default/index.css"
import "@polkadot-cloud/core/css/styles/index.css"

chrome.runtime.connect({ name: PORTS.POPUP })

render(
  <div className="theme-polkadot-relay theme-light">
    <Popup />
  </div>,
  document.getElementById("popup"),
)
