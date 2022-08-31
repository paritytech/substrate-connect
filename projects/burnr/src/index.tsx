import "regenerator-runtime/runtime"
import { createRoot } from "react-dom/client"
import App from "./App"

const container: Element | DocumentFragment = document.getElementById("app")!
const root = createRoot(container)
root.render(<App />)
