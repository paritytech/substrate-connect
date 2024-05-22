import { Card, CardDescription, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Home,
  Plus,
  Settings,
  Download,
  Code,
  ArrowRight,
  Globe,
} from "lucide-react"
import { useEffect, useState } from "react"
import { Layout2 } from "@/components/Layout2"
import { Link, useNavigate } from "react-router-dom"
import useSWR from "swr"
import { rpc } from "@/containers/WalletPopup/api"
import { ss58Address } from "@polkadot-labs/hdkd-helpers"
import React from "react"
import { cn } from "@/lib/utils"

type AccountCardProps = React.ComponentProps<typeof Card> & {
  name: string
  ss58Address: string
}

const AccountCard: React.FC<AccountCardProps> = (props) => {
  return (
    <Card key={props.name} className="p-2">
      <div className="flex items-center justify-between">
        <div>
          <CardTitle className="font-semibold text-base mb-0.5">
            {props.name}
          </CardTitle>
          <CardDescription className="text-xs truncate max-w-[240px]">
            {props.ss58Address}
          </CardDescription>
        </div>
        <Button variant="ghost" asChild>
          <Link to={`/accounts/${props.ss58Address}`}>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </div>
    </Card>
  )
}

const AccountsSkeleton: React.FC = () => {
  return new Array(10).fill(null).map((_, i) => (
    <Card
      key={`account-skeleton-card-${i}`}
      className="p-2 mb-2 transition duration-300 border rounded-lg hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <div className="w-full">
          <Skeleton className="w-5/12 h-4 mb-2" />
          <Skeleton className="w-11/12 h-3" />
        </div>
        <Button variant="ghost" disabled>
          <Skeleton className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  ))
}

export const Accounts = () => {
  const navigate = useNavigate()
  const { data: cryptoKeys, isLoading: isFetchingCryptoKeys } = useSWR(
    "rpc.getCryptoKeys",
    () => rpc.client.getCryptoKeys(),
    {
      revalidateOnFocus: true,
    },
  )

  const [selectedCryptoKeyName, setSelectedCryptoKeyName] = useState<string>()

  useEffect(() => {
    const storedCryptoKey = window.localStorage.getItem("selectedCryptoKeyName")
    if (!storedCryptoKey) return

    setSelectedCryptoKeyName(storedCryptoKey)
  }, [])

  useEffect(() => {
    if (!selectedCryptoKeyName) return

    window.localStorage.setItem("selectedCryptoKeyName", selectedCryptoKeyName)
  }, [selectedCryptoKeyName])

  const keygroup =
    cryptoKeys?.find((k) => k.name === selectedCryptoKeyName) ?? cryptoKeys?.[0]

  const accounts = keygroup?.accounts ?? []

  const keysetAccounts = accounts
    .filter((account) => account.type === "Keyset")
    .map(({ path, publicKey }) => [path, ss58Address(publicKey)] as const)
  const keypairAccounts = accounts
    .filter((account) => account.type === "Keypair")
    .map(({ publicKey }) => ss58Address(publicKey))

  const [selectedNavItem, setSelectedNavItem] = useState("home")

  const navItems = [
    { name: "home", icon: Home, onClick: () => navigate("/accounts") },
    {
      name: "networks",
      icon: Globe,
      onClick: () => setSelectedNavItem("networks"),
    },
    { name: "add", icon: Plus, onClick: () => navigate("/accounts/add") },
    {
      name: "import",
      icon: Download,
      onClick: () => navigate("/accounts/import"),
    },
    {
      name: "debug",
      icon: Code,
      onClick: () => navigate("/debug"),
    },
  ]

  return (
    <Layout2>
      <header
        className={cn(
          "flex items-center justify-between pt-6 pb-4 bg-foreground",
          "px-6 sm:px-8",
          "text-primary-foreground",
        )}
      >
        <div className="text-2xl font-semibold leading-4">
          substrate
          <span className="text-primary">_</span>
          <br />
          <span className="text-4xl text-primary">connect</span>
        </div>
        <Link to="/options" target="_blank" rel="noopener noreferrer">
          <Button type="button" variant="ghost">
            <Settings className="w-6 h-6" />
          </Button>
        </Link>
      </header>

      <div className="flex items-center justify-between px-6 mt-4 mb-4 sm:px-8">
        <h2 className="text-xl font-semibold">Your Accounts</h2>
        <Select
          disabled={!cryptoKeys || cryptoKeys.length === 0}
          value={selectedCryptoKeyName}
          onValueChange={(v) => setSelectedCryptoKeyName(v)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Crypto Key" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Crypto Keys</SelectLabel>
              {(cryptoKeys ?? []).map((key) => (
                <SelectItem key={key.name} value={key.name}>
                  {key.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <ScrollArea className="px-6 mb-4 grow sm:px-8">
        <section>
          {isFetchingCryptoKeys && <AccountsSkeleton />}
          {!isFetchingCryptoKeys && (
            <div className="pr-2 space-y-2">
              {keysetAccounts.map(([derivationPath, ss58Address]) => (
                <AccountCard name={derivationPath} ss58Address={ss58Address} />
              ))}
              {keypairAccounts.map((ss58Address, i) => (
                <AccountCard name={`Account ${i}`} ss58Address={ss58Address} />
              ))}
            </div>
          )}
        </section>
      </ScrollArea>

      <nav className="p-4 bg-foreground">
        <div className="flex justify-around">
          {navItems.map((item) => (
            <Button
              key={item.name}
              variant="ghost"
              onClick={item.onClick}
              className={`flex flex-col items-center space-y-1 hover:bg-muted-foreground ${
                selectedNavItem === item.name
                  ? "text-primary"
                  : "text-secondary hover:text-accent"
              }`}
            >
              <item.icon className="w-6 h-6 min-h-6" />
              <span className="text-xs font-medium capitalize">
                {item.name}
              </span>
            </Button>
          ))}
        </div>
      </nav>
    </Layout2>
  )
}
