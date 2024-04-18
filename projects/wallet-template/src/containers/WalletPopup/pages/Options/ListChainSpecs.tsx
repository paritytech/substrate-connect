import { Clipboard, Trash } from "lucide-react"

export const ListChainSpecs = () => {
  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4">
        <section aria-labelledby="relaychains-heading">
          <h2 id="relaychains-heading" className="text-xl font-semibold mb-4">
            Relay Chains
          </h2>
          <ul className="space-y-4">
            <li className="bg-white p-4 shadow rounded-lg flex items-start justify-between">
              <h3 className="font-semibold text-lg">Polkadot</h3>
              <div className="flex items-center">
                <Clipboard className="stroke-current text-teal-600 mr-2" />
                <Trash className="stroke-current text-red-600" />
              </div>
            </li>
            <li className="bg-white p-4 shadow rounded-lg flex items-start justify-between">
              <h3 className="font-semibold text-lg">Kusama</h3>
              <div className="flex items-center">
                <Clipboard className="stroke-current text-teal-600 mr-2" />
                <Trash className="stroke-current text-red-600" />
              </div>
            </li>
          </ul>
        </section>

        <section aria-labelledby="parachains-heading" className="mt-10">
          <h2 id="parachains-heading" className="text-xl font-semibold mb-4">
            Parachains
          </h2>
          <div
            style={{
              height: "300px",
              overflowY: "scroll",
            }}
          >
            <ul className="space-y-4">
              <li className="bg-white p-4 shadow rounded-lg flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">Acala</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Linked to: Polkadot
                  </p>
                </div>
                <div className="flex items-center">
                  <Clipboard className="stroke-current text-teal-600 mr-2" />
                  <Trash className="stroke-current text-red-600" />
                </div>
              </li>
              <li className="bg-white p-4 shadow rounded-lg flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">Moonriver</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Linked to: Kusama
                  </p>
                </div>
                <div className="flex items-center">
                  <Clipboard className="stroke-current text-teal-600 mr-2" />
                  <Trash className="stroke-current text-red-600" />
                </div>
              </li>
              <li className="bg-white p-4 shadow rounded-lg flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">Basilisk</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Linked to: Kusama
                  </p>
                </div>
                <div className="flex items-center">
                  <Clipboard className="stroke-current text-teal-600 mr-2" />
                  <Trash className="stroke-current text-red-600" />
                </div>
              </li>
              <li className="bg-white p-4 shadow rounded-lg flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">Karura</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Linked to: Kusama
                  </p>
                </div>
                <div className="flex items-center">
                  <Clipboard className="stroke-current text-teal-600 mr-2" />
                  <Trash className="stroke-current text-red-600" />
                </div>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </section>
  )
}
