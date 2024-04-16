import { HashRouter, Routes, Route, Link } from "react-router-dom"

import {
  UnlockKeyring,
  SignRequest,
  Debug,
  ChangePassword,
  Welcome,
  Accounts,
  AddAccount,
  SwitchAccount,
  ImportAccounts,
  AccountDetails,
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
            <Route path="/debug" element={<Debug />} />
            <Route path="/change-password" element={<ChangePassword />} />

            <Route path="/accounts" element={<Accounts />} />
            <Route path="/accounts/:accountId" element={<AccountDetails />} />
            <Route path="/accounts/add" element={<AddAccount />} />
            <Route path="/accounts/switch" element={<SwitchAccount />} />
            <Route path="/accounts/import" element={<ImportAccounts />} />
            <Route
              path="/sign-request/:signRequestId"
              element={<SignRequest />}
            />
          </Route>
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/unlock-keyring" element={<UnlockKeyring />} />
        </Routes>
      </main>
    </KeyringProvider>
  </HashRouter>
)

const Header = () => {
  const {
    keyring: { isLocked },
  } = useKeyring()

  if (isLocked) return null
  return (
    <header className="w-[32rem] mx-auto px-6 py-2">
      <Link to={"/debug"}>Debug</Link>
    </header>
  )
}
