import {
  Settings,
  Plus,
  ChevronRight,
  ArrowRightLeft,
  RotateCcw,
  PlusCircle,
} from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { ButtonHTMLAttributes } from "react"
import { fromHex, toHex } from "@polkadot-api/utils"
import { entropyToMiniSecret, ss58Address } from "@polkadot-labs/hdkd-helpers"
import { sr25519CreateDerive } from "@polkadot-labs/hdkd"
import { rpc } from "../api"
import useSWR from "swr"

export const Accounts = () => {
  const navigate = useNavigate()
  const { data: keysets } = useSWR("/rpc/keysets", async () => {
    return rpc.client.listKeysets()
  })
  const keysetsLength = keysets ? Object.keys(keysets).length : 0

  const reset = async () => {
    await rpc.client.clearKeysets()
    navigate(0)
  }

  const IconButton: React.FC<ButtonHTMLAttributes<HTMLButtonElement>> = ({
    onClick,
    children,
    className,
  }) => (
    <button
      onClick={onClick}
      className={`text-gray-600 mx-2 hover:text-gray-500 ${className}`}
    >
      {children}
    </button>
  )

  type AccountItemProps = {
    bgColor: string
    text: string
    subText: string
  }

  const AccountItem: React.FC<AccountItemProps> = ({
    bgColor,
    text,
    subText,
  }) => (
    <div className="flex items-center px-4 py-2 border-b">
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-full ${bgColor} mr-3`}
      ></div>
      <div className="flex-grow">
        <div className="text-sm font-medium">{text}</div>
        <div className="text-xs text-gray-500">{subText}</div>
      </div>
      <ChevronRight className="text-gray-400" />
    </div>
  )

  const EmptyAccounts = () => {
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

  const Accounts = () => {
    // TODO: use mutliple keysets
    const [keysetName, keyset] = Object.entries(keysets!)[0]
    const miniSecret = entropyToMiniSecret(fromHex(keyset.entropy))
    const derive = sr25519CreateDerive(miniSecret)
    const keypairs = keyset.derivationPaths.map(
      (path) => [path, ss58Address(toHex(derive(path).publicKey))] as const,
    )

    return (
      <section>
        <div className="flex flex-col items-center px-4 py-4">
          <img
            src="https://i.imgur.com/lp2ruGY.png"
            alt="Profile"
            className="w-24 h-24 rounded-full"
          />
          <h1 className="text-2xl font-bold mt-2">{keysetName}</h1>
        </div>
        <div className="px-4">
          <h2 className="text-lg font-semibold mb-2">Derived Keys</h2>
          <div className="bg-white rounded-lg shadow">
            {keypairs.map(([path, ss58Address]) => (
              <AccountItem
                bgColor="bg-purple-200"
                text={path}
                subText={ss58Address}
              />
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <main className="p-4">
      <div className="max-w-xl p-6 mx-auto bg-white rounded-lg shadow-lg">
        <div className="flex flex-col">
          <div className="bg-white px-4 py-2 flex items-center justify-between">
            <IconButton onClick={reset}>
              <RotateCcw />
            </IconButton>
            <div className="flex items-center">
              <Link to="/add">
                <IconButton>
                  <Plus />
                </IconButton>
              </Link>
              <IconButton>
                <ArrowRightLeft />
              </IconButton>
              <IconButton>
                <Settings />
              </IconButton>
            </div>
          </div>
        </div>
        {keysetsLength > 0 ? <Accounts /> : <EmptyAccounts />}
      </div>
    </main>
  )
}
