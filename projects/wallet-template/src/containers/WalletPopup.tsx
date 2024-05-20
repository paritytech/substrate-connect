import { HashRouter, Routes, Route } from "react-router-dom"

import {
  UnlockKeyring,
  SignRequest,
  Debug,
  ChangePassword,
  Welcome,
  AddAccount,
  SwitchAccount,
  ImportAccounts,
  AccountDetails,
  AddChainByUser,
  Accounts,
} from "./WalletPopup/pages"
import { ProtectedRoute } from "./WalletPopup/components"
import { KeyringProvider } from "./WalletPopup/hooks"
import { Options } from "./Options"
import { CreatePassword } from "./WalletPopup/pages/CreatePassword"

export const WalletPopup = () => (
  <HashRouter>
    <KeyringProvider>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Debug />} />
          <Route path="/debug" element={<Debug />} />
          <Route path="/change-password" element={<ChangePassword />} />

          <Route path="/accounts/:accountId" element={<AccountDetails />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/accounts/add" element={<AddAccount />} />
          <Route path="/accounts/switch" element={<SwitchAccount />} />
          <Route path="/accounts/import" element={<ImportAccounts />} />

          <Route
            path="/sign-request/:signRequestId"
            element={<SignRequest />}
          />
          <Route path="/add-chain-by-user" element={<AddChainByUser />} />
        </Route>
        <Route path="/options" element={<Options />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/create-password" element={<CreatePassword />} />
        <Route path="/unlock-keyring" element={<UnlockKeyring />} />
      </Routes>
    </KeyringProvider>
  </HashRouter>
)
