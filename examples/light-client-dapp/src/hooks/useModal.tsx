import type { ReactNode, ReactEventHandler } from "react"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

type Context = {
  modalIsOpen: boolean
  handleOpen: ReactEventHandler
  handleClose: ReactEventHandler
}
const ModalContext = createContext<Context>(null!)

/* eslint-disable react-refresh/only-export-components */
export const useModal = () => useContext(ModalContext)

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const htmlTag = useMemo(() => document.querySelector("html")!, [])
  const [modalIsOpen, setModalIsOpen] = useState(false)
  const modalAnimationDuration = 400

  // Handle open
  const handleOpen: ReactEventHandler = useCallback(
    (event) => {
      event.preventDefault()
      setModalIsOpen(true)
      htmlTag.classList.add("modal-is-open", "modal-is-opening")
      setTimeout(
        () => htmlTag.classList.remove("modal-is-opening"),
        modalAnimationDuration,
      )
    },
    [htmlTag],
  )

  // Handle close
  const handleClose: ReactEventHandler = useCallback(
    (event) => {
      event.preventDefault()
      htmlTag.classList.add("modal-is-closing")
      setTimeout(() => {
        setModalIsOpen(false)
        htmlTag.classList.remove("modal-is-open", "modal-is-closing")
      }, modalAnimationDuration)
    },
    [htmlTag],
  )

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (!modalIsOpen) return
      if (event.key === "Escape") {
        // @ts-expect-error event is not a SyntheticEvent
        handleClose(event)
      }
    }
    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [modalIsOpen, handleClose])

  // Set scrollbar width on mount
  useEffect(() => {
    const scrollBarWidth = getScrollBarWidth()
    htmlTag.style.setProperty("--pico-scrollbar-width", `${scrollBarWidth}px`)
    return () => {
      htmlTag.style.removeProperty("--pico-scrollbar-width")
    }
  }, [htmlTag.style])

  return (
    <ModalContext.Provider
      value={{
        modalIsOpen,
        handleOpen,
        handleClose,
      }}
    >
      {children}
    </ModalContext.Provider>
  )
}

const getScrollBarWidth = () => {
  const hasScrollbar = document.body.scrollHeight > screen.height
  if (hasScrollbar) {
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth
    return scrollbarWidth
  }
  return 0
}
