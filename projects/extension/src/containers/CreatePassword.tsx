import { FunctionComponent, useState } from "react"
import { encryptPassword } from "@substrate/secure-storage"

type Props = {
  passwordKey: string
}

const CreatePassword: FunctionComponent<Props> = ({ passwordKey }: Props) => {
  const [password, setPassword] = useState<string>("")

  const storePassword = async () => {
    const textEncoder = new TextDecoder()
    const encryptedPassword = await encryptPassword(password)
    localStorage.setItem(passwordKey, textEncoder.decode(encryptedPassword))
  }

  return (
    <>
      <div className="w-full max-w-xs" onSubmit={storePassword}>
        <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="mb-6">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              data-testid="password-field"
              id="password"
              type="password"
              placeholder="******************"
              value={password}
              onChange={(v) => {
                setPassword(v.target.value)
              }}
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
              disabled={password === ""}
            >
              Continue
            </button>
          </div>
        </form>
      </div>
    </>
  )
}

export default CreatePassword
