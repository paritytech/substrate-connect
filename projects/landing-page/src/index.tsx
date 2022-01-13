// workaround for parcel in order to work with async/await
import "regenerator-runtime/runtime"

import * as React from "react"
import * as ReactDOM from "react-dom"
import App from "./App"

ReactDOM.render(<App />, document.getElementById("app"))
