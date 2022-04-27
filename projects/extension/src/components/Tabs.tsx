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

const Tab = ({ activeTab, index, color, setOpenTab, title }: TabProps) => {
  return (
    <li className="-mb-px mr-2 last:mr-0 text-center">
      <a
        style={
          activeTab
            ? { color: "white", backgroundColor: color }
            : { color, backgroundColor: "white" }
        }
        className={
          "text-xs font-bold uppercase px-5 py-3 rounded block leading-normal"
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
}

const TabContent = ({ child, index }: TabsPanel) => {
  console.log("tabcontent", child)
  return (
    <div className={"block"} id={`"${"link".concat(index.toString())}"`}>
      {child}
    </div>
  )
}

export const Tabs = ({ tabTitles, children, color = "black" }: TabsProps) => {
  console.log("tabcontent??", children)
  const [openTab, setOpenTab] = useState<number>(0)
  return (
    <>
      <div className="flex flex-wrap">
        <div className="w-full">
          <ul
            className="flex mb-0 list-none flex-wrap pt-3 pb-4 flex-row"
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
          <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 rounded">
            <div className="px-4 py-5 flex-auto">
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
    </>
  )
}
