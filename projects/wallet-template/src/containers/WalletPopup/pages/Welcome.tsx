import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card"
import { Lock, Link, ShieldCheck } from "lucide-react"

import { cn } from "@/lib/utils"
import { Layout2 } from "@/components/Layout2"
import { useNavigate } from "react-router-dom"

export const Welcome = () => {
  const navigate = useNavigate()

  return (
    <Layout2>
      <Card className="flex-grow w-full max-w-md min-h-full rounded-none lg:rounded">
        <CardHeader className="text-center">
          <CardTitle className="mt-6 text-2xl font-extrabold">
            substrate<span className="text-primary">_</span>
            <br />
            <span className="text-5xl text-primary">Connect</span>
          </CardTitle>
          <CardDescription className="mt-2">
            The easiest way to connect to Polkadot, Kusama, and Substrate-based
            chains with a light client
          </CardDescription>
        </CardHeader>
        {/* TODO: Replace the filler text below with something real */}
        <CardContent>
          <ul className="space-y-4">
            <li className="flex items-start">
              <Lock className="w-6 h-6 text-primary" aria-hidden="true" />
              <p className="ml-3 text-base">
                Private keys are encrypted and never leave your device
              </p>
            </li>
            <li className="flex items-start">
              <ShieldCheck
                className="w-6 h-6 text-primary"
                aria-hidden="true"
              />
              <p className="ml-3 text-base">
                Protect your wallet with secure seed phrase backup
              </p>
            </li>
            <li className="flex items-start">
              <Link className="w-6 h-6 text-primary" aria-hidden="true" />
              <p className="ml-3 text-base">
                Easily connect to decentralized apps and exchanges
              </p>
            </li>
          </ul>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button
            className={cn(
              "w-full py-3",
              "text-lg text-background",
              "bg-emerald-600 hover:bg-emerald-700",
            )}
            onClick={() => navigate("/create-password")}
          >
            Create a New Wallet
          </Button>
          <Button
            // this button is just for show.
            disabled={true}
            className={cn(
              "w-full py-3",
              "text-lg text-emerald-700",
              "bg-emerald-100 hover:bg-emerald-200",
            )}
          >
            Import Existing Wallet
          </Button>
        </CardFooter>
      </Card>
    </Layout2>
  )
}
