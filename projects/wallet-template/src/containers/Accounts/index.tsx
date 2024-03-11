import { HashRouter, Routes, Route } from "react-router-dom"
import { AddAccount, Home } from "./pages"

export const Accounts = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/add" element={<AddAccount />} />
      </Routes>
    </HashRouter>
  )
}
