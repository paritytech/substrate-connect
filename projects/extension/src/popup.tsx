import { render } from "react-dom"
import Popup from "./containers/Popup"
import "./style.css"
import { PORTS } from "./shared"

chrome.runtime.connect({ name: PORTS.POPUP })

render(<Popup />, document.getElementById("popup"))
