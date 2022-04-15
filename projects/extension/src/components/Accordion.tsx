import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react"

interface AccordionProps {
  title?: ReactNode | string
  titleClass?: string
  content?: ReactNode | string
  contentClass?: string
  children?: ReactNode
  defaultExpanded?: string
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

const Accordion = ({ children, defaultExpanded }: AccordionProps) => {
  const [activeItem, setActiveItem] = useState(defaultExpanded)
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

  return (
    // @ts-ignore
    <AccordionContext.Provider value={value}>
      <div className="w-132">{children}</div>
    </AccordionContext.Provider>
  )
}

interface AccItem {
  value: string
  title: ReactNode
  children: ReactNode
}

const AccordionItem = ({ value, title, children }: AccItem) => {
  const { activeItem, setToggle } = useAccordionContext()

  return (
    <div className="items-center font-normal justify-between text-left">
      <button
        className={`"items-center bg-0 flex w-full font-sm justify-between p-3 text-left rounded-t-md border border-black ${
          value === activeItem ? "" : "rounded-b-md"
        }"`}
        aria-controls={`${value}-panel`}
        aria-disabled="false"
        aria-expanded={value === activeItem}
        id={`${value}-header`}
        onClick={() => setToggle(value)}
        type="button"
        value={value}
      >
        {title}
      </button>
      <section
        className="bg-black p-4 rounded-b-md border border-black"
        aria-hidden={activeItem !== value}
        aria-labelledby={`${value}-header`}
        hidden={activeItem !== value}
        id={`${value}-panel`}
      >
        {children}
      </section>
    </div>
  )
}
export { Accordion, AccordionItem }
