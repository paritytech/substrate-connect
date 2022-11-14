import React, { useEffect, useState } from "react"

type manipulateBootnodeType = (
  bootnode: string,
  add: boolean,
  defaultBootnode: boolean,
) => void

interface SwitchProps {
  bootnode: string
  alterBootnodes: manipulateBootnodeType
  defaultBootnode: boolean
  isChecked: boolean
}

const Switch = ({
  bootnode,
  alterBootnodes,
  defaultBootnode,
  isChecked,
}: SwitchProps) => {
  const [checked, setChecked] = useState<boolean>(isChecked)

  useEffect(() => {
    setChecked(isChecked)
  }, [isChecked])

  return (
    <div className="flex w-1/12 ml-8" key={bootnode}>
      <label className="inline-flex relative items-center mr-5 cursor-pointer">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={checked}
          readOnly
        />
        <div
          onClick={() => {
            alterBootnodes(bootnode, !checked, defaultBootnode)
            setChecked(!checked)
          }}
          className="w-11 h-6 bg-gray-200 rounded-full peer  peer-focus:ring-green-300  peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#16DB9A]"
        ></div>
      </label>
    </div>
  )
}

export { Switch }
