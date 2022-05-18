import React, {
  createContext,
  FunctionComponent,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react"
import { StatusCircle } from "."

import { NetworkTabProps, App, OptionsNetworkTabHealthContent } from "../types"
import "../main.css"

export const emojis = {
  chain: "🔗",
  tick: "✅",
  info: "ℹ️",
  deal: "🤝",
  chequeredFlag: "🏁",
  star: "✨",
  clock: "🕒",
  apps: "📺",
  seedling: "🌱",
}

const networkColors: Record<string, string> = {
  polkadot: "#E6007A",
  kusama: "#2F2F2F",
  westend: "#FF9C28",
  rococo: "#696bff",
}

interface NetworkContentProps {
  health: OptionsNetworkTabHealthContent
  apps: App[]
  network: string
}

interface AccordionProps {
  titles: ReactNode[] | string[]
  titleClass?: string
  contents: ReactNode[] | string[]
  contentClass?: string
  defaultExpanded?: number
}

interface AccItem {
  value: string
  title: ReactNode
  children: ReactNode
  titleClass?: string
  contentClass?: string
  status?: "first" | "last" | "single"
}

const AccordionContext = createContext({
  activeItem: "",
  setToggle: (val: string) => {
    console.log(val)
  },
})

const useAccordionContext = () => {
  const context = useContext(AccordionContext)
  if (!context) {
    throw new Error("No context found for Accordion")
  }
  return context
}

const NetworkContent = ({ network, health, apps }: NetworkContentProps) => {
  return (
    <div className="w-full text-white text-xs">
      <div className="flex flex-row">
        <div className="basis-1/3 text-neutral-400">
          {emojis.seedling} Light Client
        </div>
        <div className="basis-2/3">
          {health.isSyncing ? "Synchronizing" : "Synchronized"}
        </div>
      </div>
      <div className="flex flex-row">
        <div className="basis-1/3 text-neutral-400">{emojis.star} Network</div>
        <div className="basis-2/3">{network}</div>
      </div>
      <div className="flex flex-row">
        <div className="basis-1/3"></div>
        <div className="basis-2/3">Chain is {health.status}</div>
      </div>

      <div className="flex flex-row">
        <div className="basis-1/3 text-neutral-400">{emojis.deal} Peers</div>
        <div className="basis-2/3">{health.peers}</div>
      </div>
      <div className="flex flex-row">
        <div className="basis-1/3 text-neutral-400">{emojis.apps} Apps</div>
        <div className="basis-2/3">{apps.length}:</div>
      </div>
      <div className="flex flex-row">
        <div className="basis-1/3"></div>
        <div className="basis-2/3">
          {apps.map((app) => (
            <div className="flex" key={app.url}>
              {app.url}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const AccordionItem = ({
  value,
  title,
  children,
  titleClass,
  contentClass,
  status,
}: AccItem) => {
  const { activeItem, setToggle } = useAccordionContext()

  const expanded = activeItem === value

  return (
    <div className={status && `item _mi__${status}`}>
      <button
        className={`item_title bg-white `
          .concat(
            `${
              expanded && (status === "single" || status === "last")
                ? "content_closed "
                : ""
            }`,
          )
          .concat(titleClass || "")}
        aria-controls={`${value}-panel`}
        aria-disabled="false"
        aria-expanded={expanded}
        id={`${value}-header`}
        onClick={() => setToggle(value)}
        type="button"
        value={value}
      >
        {title}
      </button>
      <section
        className={`item_content font-roboto `
          .concat(
            `${
              expanded && (status === "single" || status === "last")
                ? "content_expanded "
                : ""
            }`,
          )
          .concat(contentClass || "")}
        aria-hidden={!expanded}
        aria-labelledby={`${value}-header`}
        hidden={!expanded}
      >
        {children}
      </section>
    </div>
  )
}

const Accordion = ({
  titles,
  contents,
  defaultExpanded,
  titleClass,
  contentClass,
}: AccordionProps): JSX.Element => {
  const [activeItem, setActiveItem] = useState<string | undefined>(
    defaultExpanded?.toString(),
  )
  const setToggle = useCallback(
    (value: string) => {
      setActiveItem(() => {
        if (activeItem !== value) return value
        return ""
      })
    },
    [setActiveItem, activeItem],
  )

  const value = useMemo(
    () => ({
      activeItem,
      setToggle,
      defaultExpanded,
    }),
    [setToggle, activeItem, defaultExpanded],
  )

  if (titles.length !== contents.length) {
    console.error("Titles do not have same length as contents.")
    return (
      <div>
        Titles given do not have same length as contents. Please check the input
        parameters.
      </div>
    )
  }

  return (
    // @ts-ignore
    <AccordionContext.Provider value={value}>
      {titles.map((title, index) => {
        const stat =
          titles.length === 1
            ? "single"
            : index === 0
            ? "first"
            : index === titles?.length - 1
            ? "last"
            : undefined
        return (
          <AccordionItem
            title={title}
            value={index.toString()}
            titleClass={titleClass}
            contentClass={contentClass}
            status={stat}
          >
            {contents[index]}
          </AccordionItem>
        )
      })}
    </AccordionContext.Provider>
  )
}

const NetworkTab: FunctionComponent<NetworkTabProps> = ({
  name,
  health,
  apps,
}: NetworkTabProps) => {
  return (
    <div className="flex w-full max-w-2xl mb-3">
      <div className="flex items-center justify-center w-12 h-12">
        <StatusCircle
          size="ml"
          color={
            health && health.status === "connected" ? "#16DB9A" : "transparent"
          }
        />
      </div>
      <Accordion
        titles={[
          <div className="flex rounded-lg">
            <div className="networkicon_container">
              <div className="txt-xl cap">{name.toLowerCase()}</div>
            </div>
          </div>,
        ]}
        contents={[
          <NetworkContent health={health} apps={apps} network={name} />,
        ]}
      ></Accordion>
    </div>
  )
}

export default NetworkTab
