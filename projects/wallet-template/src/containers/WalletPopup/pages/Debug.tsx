import { Link } from "react-router-dom"
import { useKeyring } from "../hooks"
import { Layout2 } from "@/components/Layout2"
import { BottomNavBar, Header } from "../components"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { KeyIcon, LockIcon } from "lucide-react"

export const Debug: React.FC = () => {
  const { lock } = useKeyring()

  return (
    <Layout2>
      <Header />
      <div className="flex items-center justify-between px-6 mt-4 mb-4 sm:px-8">
        <h2 className="text-xl font-semibold">Debug</h2>
      </div>
      <ScrollArea className="px-6 mb-4 grow sm:px-8">
        <div className="flex flex-col space-y-4">
          <Button variant="outline" onClick={() => lock()}>
            <LockIcon className="w-4 h-4 mr-2 text-muted-foreground" />
            Lock Wallet
          </Button>
          <Button variant="outline" asChild>
            <Link to={"/change-password"}>
              <>
                <KeyIcon className="w-4 h-4 mr-2 text-muted-foreground" />
                Change Password
              </>
            </Link>
          </Button>
        </div>
      </ScrollArea>
      <BottomNavBar currentItem="debug" />
    </Layout2>
  )
}
