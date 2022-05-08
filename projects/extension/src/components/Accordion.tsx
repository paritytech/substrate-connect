import React, { ReactNode, useCallback, useMemo, useState } from "react"
import { useContext, createContext } from "react"

interface AccItem {
  value: string
  title: ReactNode
  children: ReactNode
  titleClass?: string
  contentClass?: string
  status?: "first" | "last" | "single"
}

interface AccordionProps {
  titles: ReactNode[] | string[]
  titleClass?: string
  contents: ReactNode[] | string[]
  contentClass?: string
  defaultExpanded?: number
}

const useAccordionContext = () => {
  const context = useContext(AccordionContext)
  if (!context) {
    throw new Error("No context found for Accordion")
  }
  return context
}

const AccordionContext = createContext({
  activeItem: "",
  setToggle: (val: string) => {
    console.log(val)
  },
})

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
        className={`item_title `
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
        className={`item_content `
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

export const Accordion = ({
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
