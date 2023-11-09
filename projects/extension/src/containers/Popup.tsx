import { FunctionComponent, useEffect, useState } from "react"
import { BraveModal } from "../components"
import * as environment from "../environment"
import { NetworksTab } from "./NetworksTab"
import { Header } from "./Header"
import { AccountsTab } from "./AccountsTab"
import { Footer } from "./Footer"
import { Tabs } from "./Tabs"

export const Popup: FunctionComponent = () => {
  const [showModal, setShowModal] = useState<boolean>(false)

  useEffect(() => {
    // Identify Brave browser and show Popup
    window.navigator?.brave?.isBrave().then(async (isBrave: any) => {
      const braveSetting = await environment.get({ type: "braveSetting" })
      setShowModal(isBrave && !braveSetting)
    })
  }, [])

  return (
    <>
      <BraveModal show={showModal} />
      <main className="w-80">
        <Header />
        <Tabs
          color={"#16DB9A"}
          titles={["Accounts", "Networks"]}
          tabs={[<AccountsTab />, <NetworksTab />]}
        />
        <Footer />
      </main>
    </>
  )
}
