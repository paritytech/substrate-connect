import React from "react"
import { render } from "react-dom"
import { Options } from "./containers/Options"
import "./style.css"
import { OPTIONS_PORT } from "./shared"

chrome.runtime.connect({ name: OPTIONS_PORT })

render(<Options />, document.getElementById("options"))
