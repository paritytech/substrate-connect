import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card"
import { Lock, Link, ShieldCheck, ArrowLeft } from "lucide-react"
import { useState } from "react"

function CryptoWalletWelcome() {
  const [showCreatePassword, setShowCreatePassword] = useState(false)
  return (
    <main className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 text-white min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {!showCreatePassword ? (
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="relative text-teal-400 text-6xl font-bold">_</div>
            <CardTitle className="font-sans mt-6 text-2xl font-extrabold">
              substrate
              <br />
              <span className="font-sans text-primary text-5xl">Connect</span>
            </CardTitle>
            <CardDescription className="mt-2 font-sans">
              The easiest way to connect to Polkadot, Kusama, and
              Substrate-based chains with a light client
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              <li className="flex items-start">
                <Lock className="h-6 w-6 text-emerald-400" aria-hidden="true" />
                <p className="font-sans ml-3 text-base">
                  Private keys are encrypted and never leave your device
                </p>
              </li>
              <li className="flex items-start">
                <ShieldCheck
                  className="h-6 w-6 text-emerald-400"
                  aria-hidden="true"
                />
                <p className="font-sans ml-3 text-base">
                  Protect your wallet with secure seed phrase backup
                </p>
              </li>
              <li className="flex items-start">
                <Link className="h-6 w-6 text-emerald-400" aria-hidden="true" />
                <p className="font-sans ml-3 text-base">
                  Easily connect to decentralized apps and exchanges
                </p>
              </li>
            </ul>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              className="font-sans w-full py-3 text-lg bg-emerald-600 hover:bg-emerald-700 text-background"
              onClick={() => setShowCreatePassword(true)}
            >
              Create a New Wallet
            </Button>
            <Button className="font-sans w-full py-3 text-lg text-emerald-700 bg-emerald-100 hover:bg-emerald-200">
              Import Existing Wallet
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="relative text-teal-400 text-6xl font-bold">_</div>
            <CardTitle className="mt-6 text-2xl font-extrabold">
              substrate
              <br />
              <span className="text-green-400 text-5xl">Connect</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="Password" />
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5 mt-4">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirm Password"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700"
            >
              Create Wallet
            </Button>
            <Button
              type="button"
              className="w-full py-2 text-emerald-700 bg-emerald-100 hover:bg-emerald-200"
              onClick={() => setShowCreatePassword(false)}
            >
              <ArrowLeft
                className="h-5 w-5 text-emerald-500 mr-2"
                aria-hidden="true"
              />
              Go Back
            </Button>
          </CardFooter>
        </Card>
      )}
    </main>
  )
}

export { CryptoWalletWelcome }
