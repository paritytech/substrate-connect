import * as tabs from "@zag-js/tabs"
import { useMachine, normalizeProps } from "@zag-js/react"
import { useId } from "react"

import { AddChainSpec } from "./AddChainSpec"
import { ListChainSpecs } from "./ListChainSpecs"

const data = [
  { value: "list", label: "List" },
  { value: "add", label: "Add" },
] as const

export const ChainSpecs = () => {
  const [state, send] = useMachine(tabs.machine({ id: useId(), value: "list" }))

  const api = tabs.connect(state, send, normalizeProps)

  return (
    <div className="max-w-xl mx-auto p-4">
      <header className="text-center">
        <h1 className="text-2xl font-bold">Manage Chain Specifications</h1>
      </header>

      <div {...api.rootProps}>
        <div className="flex justify-around my-4" {...api.listProps}>
          {data.map((item) => (
            <button
              {...api.getTriggerProps({ value: item.value })}
              key={item.value}
              className={`px-4 py-2 font-semibold rounded-md ${api.value === item.value ? "bg-blue-500 text-white" : "bg-gray-100"}`}
            >
              {item.label}
            </button>
          ))}
        </div>
        {data.map((item) => (
          <div
            {...api.getContentProps({ value: item.value })}
            className="mt-6"
            key={item.value}
          >
            {item.value === "add" && <AddChainSpec />}
            {item.value === "list" && <ListChainSpecs />}
          </div>
        ))}
      </div>
    </div>
  )
}
