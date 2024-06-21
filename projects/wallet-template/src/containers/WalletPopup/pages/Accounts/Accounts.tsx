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
import { ArrowRight } from "lucide-react"
import { useEffect, useState } from "react"
import { Layout2 } from "@/components/Layout2"
import { Link } from "react-router-dom"
import useSWR from "swr"
import { rpc } from "@/containers/WalletPopup/api"
import { ss58Address } from "@polkadot-labs/hdkd-helpers"
import React from "react"
import { Header, BottomNavBar } from "../../components"

type AccountCardProps = React.ComponentProps<typeof Card> & {
  name: string
  ss58Address: string
}

const AccountCard: React.FC<AccountCardProps> = (props) => {
  return (
    <Card data-testid={props.name} key={props.name} className="p-2">
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
          <Link
            data-testid={`${props.name}-expand`}
            to={`/accounts/${props.ss58Address}`}
          >
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

  return (
    <Layout2>
      <Header />
      <div className="flex items-center justify-between px-6 mt-4 mb-4 sm:px-8">
        <h2 className="text-xl font-semibold">Your Accounts</h2>
        <Select
          disabled={!cryptoKeys || cryptoKeys.length === 0}
          value={selectedCryptoKeyName}
          onValueChange={(v) => setSelectedCryptoKeyName(v)}
        >
          <SelectTrigger className="w-[180px]" data-testid="accounts-select">
            <SelectValue placeholder="Select Crypto Key" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Crypto Keys</SelectLabel>
              {(cryptoKeys ?? []).map((key) => (
                <SelectItem
                  data-testid={`accounts-select-${key.name}`}
                  key={key.name}
                  value={key.name}
                >
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

      <BottomNavBar currentItem="home" />
    </Layout2>
  )
}
