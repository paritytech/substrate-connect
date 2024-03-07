import { HashRouter, Routes, Route } from "react-router-dom"

import { UnlockKeyring, LockKeyring, SignRequest } from "./WalletPopup/pages"
import { ProtectedRoute } from "./WalletPopup/components"
import { KeyringProvider } from "./WalletPopup/hooks"

export const WalletPopup = () => (
  <HashRouter>
    <KeyringProvider>
      <main className="w-[32rem] mx-auto px-6 py-8">
        <Routes>
          <Route path="/unlock-keyring" element={<UnlockKeyring />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/lock-keyring" element={<LockKeyring />} />
            <Route
              path="/sign-request/:signRequestId"
              element={<SignRequest />}
            />
          </Route>
        </Routes>
      </main>
    </KeyringProvider>
  </HashRouter>
)
