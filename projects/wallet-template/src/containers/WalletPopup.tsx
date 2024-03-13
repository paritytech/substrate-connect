import { HashRouter, Routes, Route, Link } from "react-router-dom"

import {
  UnlockKeyring,
  SignRequest,
  Debug,
  ChangePassword,
  Accounts,
  AddAccount,
} from "./WalletPopup/pages"
import { ProtectedRoute } from "./WalletPopup/components"
import { KeyringProvider, useKeyring } from "./WalletPopup/hooks"

export const WalletPopup = () => (
  <HashRouter>
    <KeyringProvider>
      <Header />
      <main className="w-[32rem] mx-auto px-6 py-8">
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Debug />} />
            <Route path="/change-password" element={<ChangePassword />} />
            <Route path="/accounts" element={<Accounts />} />
            <Route path="/accounts/add" element={<AddAccount />} />
            <Route
              path="/sign-request/:signRequestId"
              element={<SignRequest />}
            />
          </Route>
          <Route path="/unlock-keyring" element={<UnlockKeyring />} />
        </Routes>
      </main>
    </KeyringProvider>
  </HashRouter>
)

const Header = () => {
  const { isLocked } = useKeyring()
  if (isLocked) return null
  return (
    <header className="w-[32rem] mx-auto px-6 py-2">
      <Link to={"/"}>Debug</Link>
    </header>
  )
}
