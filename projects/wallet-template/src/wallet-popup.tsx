import { StrictMode } from "react"
import { render } from "react-dom"
import { WalletPopup } from "./containers"
import "./style.css"

render(
  <StrictMode>
    <WalletPopup />
  </StrictMode>,
  document.getElementById("popup"),
)
