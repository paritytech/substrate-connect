import { ArrowLeft, Key, Lock } from "lucide-react"
import { useState } from "react"

export function ImportAccounts() {
  const [activeTab, setActiveTab] = useState("private")
  const [privateKey, setPrivateKey] = useState("")
  const [publicKey, setPublicKey] = useState("")
  const [keysetName, setKeysetName] = useState("")
  const isValidPrivateKey = (input: string) => {
    return /^[\da-f]{64}$/i.test(input)
  }
  const isValidPublicKey = (input: string) => {
    return /^0x[\da-f]{66}$/i.test(input)
  }
  const importWallet = () => {
    console.log("Importing wallet...")
    // Assume wallet import logic goes here
  }

  return (
    <main className="p-4">
      <div className="flex items-center mb-6">
        <button
          onClick={() => window.history.back()}
          className="mr-auto flex items-center"
        >
          <ArrowLeft className="mr-2" />
          Go Back
        </button>
      </div>
      <header className="text-center mb-6">
        <h1 className="text-xl font-semibold mb-2">Import Wallet</h1>
        <p>Enter your private key or public key to access your wallet</p>
      </header>
      <div className="mb-6">
        <div className="flex justify-center gap-4 mb-4">
          <button
            onClick={() => setActiveTab("private")}
            className={`p-2 ${activeTab === "private" ? "font-semibold" : ""}`}
          >
            <Key className="inline-block mr-2" />
            Private Key
          </button>
          <button
            onClick={() => setActiveTab("public")}
            className={`p-2 ${activeTab === "public" ? "font-semibold" : ""}`}
          >
            <Lock className="inline-block mr-2" />
            Public Key
          </button>
        </div>
        {activeTab === "private" && (
          <>
            <input
              type="text"
              placeholder="Enter your private key"
              className="w-full p-2 mb-2"
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
            />
            <select
              className="w-full p-2 mb-4"
              value={keysetName}
              onChange={(e) => setKeysetName(e.target.value)}
            >
              <option disabled>Select keyset name</option>
              <option value="defaultKeyset">Default Keyset</option>
              <option value="backupKeyset">Backup Keyset</option>
            </select>
          </>
        )}
        {activeTab === "public" && (
          <>
            <input
              type="text"
              placeholder="Enter your public key"
              className="w-full p-2 mb-2"
              value={publicKey}
              onChange={(e) => setPublicKey(e.target.value)}
            />
            <select
              className="w-full p-2 mb-4"
              value={keysetName}
              onChange={(e) => setKeysetName(e.target.value)}
            >
              <option disabled>Select keyset name</option>
              <option value="defaultKeyset">Default Keyset</option>
              <option value="backupKeyset">Backup Keyset</option>
            </select>
          </>
        )}
      </div>
      <button
        onClick={importWallet}
        className={`w-full p-3 ${
          isValidPrivateKey(privateKey) || isValidPublicKey(publicKey)
            ? "bg-blue-500 text-white"
            : "bg-gray-200 text-gray-500 cursor-not-allowed"
        }`}
        disabled={
          !(isValidPrivateKey(privateKey) || isValidPublicKey(publicKey))
        }
      >
        Import Wallet
      </button>
      {activeTab === "private" &&
        !isValidPrivateKey(privateKey) &&
        privateKey && <p className="text-red-500 mt-2">Invalid private key</p>}
      {activeTab === "public" && !isValidPublicKey(publicKey) && publicKey && (
        <p className="text-red-500 mt-2">Invalid public key</p>
      )}
    </main>
  )
}
