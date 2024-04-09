import {
  Settings,
  Plus,
  ChevronRight,
  ArrowRightLeft,
  RotateCcw,
  PlusCircle,
  Import,
} from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { ss58Address } from "@polkadot-labs/hdkd-helpers"
import { rpc } from "../../api"
import { IconButton } from "../../../../components"
import { Keyset, KeystoreAccount } from "../../../../background/types"
import useSWR from "swr"

type AccountItemProps = {
  bgColor: string
  heading?: string
  ss58Address: string
}

const AccountItem: React.FC<AccountItemProps> = ({
  bgColor,
  heading,
  ss58Address,
}) => {
  const maxLength = 32
  const ellipsisText =
    ss58Address.length > maxLength
      ? `${ss58Address.substring(0, maxLength / 2)}...${ss58Address.substring(ss58Address.length - maxLength / 2, ss58Address.length)}`
      : ss58Address

  return (
    <div className="flex items-center px-4 py-2 border-b">
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-full ${bgColor} mr-3`}
      ></div>
      <div className="flex-grow">
        {heading ? (
          <>
            <div className="text-sm font-medium">{heading}</div>
            <div className="text-xs text-gray-500">{ellipsisText}</div>
          </>
        ) : (
          <div className="font-medium text-gray-500">{ellipsisText}</div>
        )}
      </div>
      <ChevronRight className="text-gray-400" />
    </div>
  )
}

const EmptyAccounts: React.FC = () => {
  return (
    <section>
      <div className="text-center">
        <div className="mb-6">
          <PlusCircle className="w-24 h-24 mx-auto text-gray-400" />
        </div>
        <h1 className="mb-2 text-xl font-semibold text-gray-700">
          No Accounts Added
        </h1>
        <p className="mb-4 text-gray-600">
          You haven't added any accounts yet. Let's get started.
        </p>
        <Link to={"/accounts/add"}>
          <button
            type="button"
            className="inline-flex items-center justify-center px-4 py-2 text-white bg-teal-600 border border-transparent rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Add Account
          </button>
        </Link>
      </div>
    </section>
  )
}

type AccountsListProps = {
  keyset: Keyset
}

const AccountsList: React.FC<AccountsListProps> = ({ keyset }) => {
  const keysetAccounts = keyset.accounts
    .filter(
      (account): account is Extract<KeystoreAccount, { type: "Keyset" }> =>
        account.type === "Keyset",
    )
    .map(({ path, publicKey }) => [path, ss58Address(publicKey)] as const)
  const keypairAccounts = keyset.accounts
    .filter(
      (account): account is Extract<KeystoreAccount, { type: "Keypair" }> =>
        account.type === "Keypair",
    )
    .map(({ publicKey }) => ss58Address(publicKey))

  return (
    <section>
      <div className="flex flex-col items-center px-4 py-4">
        <img
          src="https://i.imgur.com/lp2ruGY.png"
          alt="Profile"
          className="w-24 h-24 rounded-full"
        />
        <h1 className="text-2xl font-bold mt-2">{keyset.name}</h1>
      </div>
      <div className="px-4">
        <h2 className="text-lg font-semibold mb-2">Keypairs</h2>
        <div className="bg-white rounded-lg shadow mb-4">
          {keysetAccounts.map(([path, ss58Address]) => (
            <AccountItem
              bgColor="bg-purple-200"
              heading={path}
              ss58Address={ss58Address}
            />
          ))}
        </div>

        <div className="bg-white rounded-lg shadow mb-4">
          {keypairAccounts.map((ss58Address) => (
            <AccountItem bgColor="bg-purple-200" ss58Address={ss58Address} />
          ))}
        </div>
      </div>
    </section>
  )
}

export const Accounts = () => {
  const navigate = useNavigate()
  const { data: keysets, mutate } = useSWR(
    "rpc.getKeysets",
    () => rpc.client.getKeysets(),
    {
      revalidateOnFocus: true,
    },
  )
  const selectedKeysetName = window.localStorage.getItem("selectedKeysetName")
  const keyset =
    keysets?.find((k) => k.name === selectedKeysetName) ?? keysets?.[0]

  const reset = async () => {
    await rpc.client.clearKeysets()
    await mutate()
    navigate(0)
  }

  return (
    <main className="max-w-xl flex flex-col">
      <div className="bg-white px-4 py-2 flex items-center justify-between">
        <IconButton onClick={reset}>
          <RotateCcw />
        </IconButton>
        <div className="flex items-center">
          <IconButton disabled={!keysets || keysets.length === 0}>
            <Link to="/accounts/import">
              <Import />
            </Link>
          </IconButton>
          <IconButton>
            <Link to="/accounts/add">
              <Plus />
            </Link>
          </IconButton>
          <IconButton disabled={!keyset}>
            <Link
              to="/accounts/switch"
              className={!keyset ? "pointer-events-none" : ""}
            >
              <ArrowRightLeft />
            </Link>
          </IconButton>
          <IconButton>
            <Settings />
          </IconButton>
        </div>
      </div>
      {keyset ? <AccountsList keyset={keyset} /> : <EmptyAccounts />}
    </main>
  )
}
