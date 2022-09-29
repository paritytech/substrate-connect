import React, {
  ReactNode,
  useCallback,
  useMemo,
  useState,
  useContext,
  createContext,
} from "react"
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io"

interface AccItem {
  value: string
  title: ReactNode
  children: ReactNode
  titleClass?: string
  contentClass?: string
  status?: "first" | "last" | "single"
  showTitleIcon?: boolean
}

interface AccordionProps {
  origin?: "popup" | "options"
  titles: ReactNode[] | string[]
  titleClass?: string
  contents: ReactNode[] | string[]
  contentClass?: string
  defaultExpanded?: number
  showTitleIcon?: boolean
  defaultAllExpanded?: boolean
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
  defaultAllExpanded: false,
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
  showTitleIcon,
}: AccItem) => {
  const { activeItem, setToggle, defaultAllExpanded } = useAccordionContext()

  const expanded = defaultAllExpanded
    ? activeItem !== value
    : activeItem === value

  const arrowPosition =
    origin !== "popup" ? "pr-4" : "pr-4 top-8 right-2 absolute"

  return (
    <div className={status && `item _mi__${status}`}>
      <button
        className={`item_title relative `
          .concat(
            `${
              expanded && (status === "single" || status === "last")
                ? "content_opened "
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
        {showTitleIcon && (
          <div className={arrowPosition}>
            {activeItem !== value ? (
              <IoIosArrowDown className="cursor-pointer hover:bg-gray-200" />
            ) : (
              <IoIosArrowUp className="cursor-pointer hover:bg-gray-200" />
            )}
          </div>
        )}
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
  origin = "popup",
  titles,
  contents,
  defaultExpanded,
  titleClass,
  contentClass,
  showTitleIcon,
  defaultAllExpanded,
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
      defaultAllExpanded,
    }),
    [setToggle, activeItem, defaultExpanded, defaultAllExpanded],
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
            showTitleIcon={showTitleIcon}
          >
            {contents[index]}
          </AccordionItem>
        )
      })}
    </AccordionContext.Provider>
  )
}
