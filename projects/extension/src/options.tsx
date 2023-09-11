import React from "react"
import { render } from "react-dom"
import { Options } from "./containers/Options"
import "./style.css"
import { PORTS } from "./shared"

chrome.runtime.connect({ name: PORTS.OPTIONS })

render(<Options />, document.getElementById("options"))
