import React, { useState } from "react"

interface TabsProps {
  tabTitles: string[]
  children: React.ReactNode
  color?: string
}

interface TabProps {
  activeTab: boolean
  index: number
  color: string
  title: string
  setOpenTab: (i: number) => void
}

interface TabsPanel {
  index: number
  child: React.ReactNode
}

const Tab = ({ activeTab, index, color, setOpenTab, title }: TabProps) => (
  <li className="mr-2 -mb-px text-center last:mr-0">
    <a
      style={
        activeTab
          ? { color: "white", backgroundColor: color }
          : { color, backgroundColor: "white" }
      }
      className={
        "block rounded px-5 py-3 text-xs font-bold uppercase leading-normal"
      }
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

const TabContent = ({ child, index }: TabsPanel) => (
  <div className={"block"} id={`"${"link".concat(index.toString())}"`}>
    {child}
  </div>
)

export const Tabs = ({ tabTitles, children, color = "black" }: TabsProps) => {
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
              }}
              title={t}
            />
          ))}
        </ul>
        <div className="relative flex flex-col w-full min-w-0 mb-6 break-words bg-white rounded">
          <div className="flex-auto px-4 py-5">
            <div className="tab-content tab-space">
              {React.Children.map(
                children,
                (c, i) => openTab === i && <TabContent child={c} index={i} />,
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
