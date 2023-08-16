import React from "react"
import { render } from "react-dom"
import Popup from "./containers/Popup"
import "./style.css"
import { POPUP_PORT } from "./shared"

chrome.runtime.connect({ name: POPUP_PORT })

render(<Popup />, document.getElementById("popup"))
