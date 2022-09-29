import React, { useState } from "react"

interface TabsProps {
  tabTitles: string[]
  color?: string
  setActiveTab: (n: number) => void
}

interface TabProps {
  activeTab: boolean
  index: number
  color: string
  title: string
  setOpenTab: (i: number) => void
}

const Tab = ({ activeTab, index, color, setOpenTab, title }: TabProps) => (
  <li className="mr-2 -mb-px text-center last:mr-0 bg-white">
    <a
      style={
        activeTab
          ? {
              color: "#24CC85",
              textDecoration: "underline",
              fontWeight: "700",
            }
          : { color, fontWeight: "normal" }
      }
      className={"block rounded px-5 py-3 text-xl leading-normal capitalize"}
      onClick={(e) => {
        e.preventDefault()
        setOpenTab(index)
      }}
      data-toggle="tab"
      href={`${"#link".concat(index.toString())}`}
      role="tablist"
    >
      {title}
    </a>
  </li>
)

export const Tabs = ({
  tabTitles,
  color = "black",
  setActiveTab,
}: TabsProps) => {
  const [openTab, setOpenTab] = useState<number>(0)
  return (
    <div className="flex flex-wrap">
      <div className="w-full">
        <ul
          className="flex flex-row flex-wrap pt-3 pb-4 mb-0 list-none"
          role="tablist"
        >
          {tabTitles.map((t, i) => (
            <Tab
              activeTab={openTab === i}
              index={i}
              color={color}
              setOpenTab={(i) => {
                setOpenTab(i)
                setActiveTab(i)
              }}
              title={t}
            />
          ))}
        </ul>
      </div>
    </div>
  )
}
