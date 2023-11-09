import { useState } from "react"

export interface TabsProps {
  color: string
  titles: string[]
  tabs: JSX.Element[]
  active?: number
}

export const Tabs = ({ color, titles, tabs, active }: TabsProps) => {
  const [openTab, setOpenTab] = useState(active || 0)

  return (
    <div className="flex flex-wrap">
      <div className="w-full">
        <ul className="flex mb-0 list-none flex-wrap flex-row" role="tablist">
          {titles.map((title, i) => {
            return (
              <li
                className="-mb-px last:mr-0 flex-auto text-center"
                style={{
                  borderTop: "0.1rem solid " + color,
                  borderBottom: "0.1rem solid " + color,
                }}
              >
                <a
                  style={openTab === i ? { backgroundColor: color } : { color }}
                  className={
                    "text-xs font-bold px-5 py-3 block leading-normal " +
                    (openTab === i ? "text-white" : "bg-white")
                  }
                  onClick={(e) => {
                    e.preventDefault()
                    setOpenTab(i)
                  }}
                  data-toggle="tab"
                  href={"#link" + i}
                  role="tablist"
                >
                  {title}
                </a>
              </li>
            )
          })}
        </ul>
        <div className="relative flex flex-col min-w-0 break-words w-full mb-6">
          <div className="tab-content tab-space">
            {tabs.map((element, i) => {
              return (
                <div
                  className={openTab === i ? "block" : "hidden"}
                  id={"link" + i}
                >
                  {element}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
