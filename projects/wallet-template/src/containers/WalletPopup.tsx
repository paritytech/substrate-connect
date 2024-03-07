import { HashRouter, Routes, Route } from "react-router-dom"

import { SignRequest } from "./WalletPopup/pages"

export const WalletPopup = () => {
  return (
    <HashRouter>
      <main className="w-[32rem] mx-auto px-6 py-8">
        <Routes>
          <Route
            path="/sign-request/:signRequestId"
            element={<SignRequest />}
          />
        </Routes>
      </main>
    </HashRouter>
  )
}
