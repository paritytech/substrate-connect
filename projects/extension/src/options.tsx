import React from "react"
import { render } from "react-dom"
import { Options } from "./containers/Options"
import "./style.css"
import { PORTS } from "./shared"

chrome.runtime.connect({ name: PORTS.OPTIONS })

console.log(document.getElementById("options"))

render(<Options />, document.getElementById("options"))
