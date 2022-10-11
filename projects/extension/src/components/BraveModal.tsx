import React, { useEffect, useState } from "react"
import * as environment from "../environment"

interface Props {
  isOptions?: boolean
  show: boolean
}

const openInNewTab = (url: string): void => {
  const newWindow = window.open(url, "_blank", "noopener,noreferrer")
  if (newWindow) newWindow.opener = null
}

export const BraveModal = ({ show, isOptions }: Props) => {
  const [showModal, setShowModal] = useState<boolean>(show)

  useEffect(() => {
    setShowModal(show)
  }, [show])

  let contentClassName = "relative bg-white shadow dark:bg-gray-700 "
  contentClassName += isOptions ? "rounded-b-lg" : "rounded-t-lg"

  return (
    <div
      id="defaultModal"
      className={`${isOptions ? "relative " : ""} ${
        showModal ? "" : "hidden "
      }overflow-y-auto overflow-x-hidden fixed bottom-0 right-0 left-0 z-50 w-full md:inset-0 h-modal md:h-full`}
    >
      <div className="relative w-full h-full md:h-auto">
        {/*-- Modal content */}
        <div className={contentClassName}>
          {/*-- Modal header */}
          <div className="flex justify-between items-start py-2 px-4 rounded-t dark:border-gray-600">
            <h5 className="text-base font-semibold text-gray-900 dark:text-white">
              Attention Brave Users
            </h5>
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-xs p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
            >
              <svg
                aria-hidden="true"
                className="w-3 h-3"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                ></path>
              </svg>
              <span className="sr-only">Close modal</span>
            </button>
          </div>
          {/*-- Modal body */}
          <div className="py-2 px-4 space-y-2">
            <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">
              Due to a{" "}
              <a
                rel="noreferrer"
                target="_blank"
                className="font-bold underline hover:color-gray"
                href="https://github.com/brave/brave-browser/issues/19990"
              >
                recent Brave update (1.36.109)
              </a>
              , some results may not display correctly. Disabling, in Brave
              settings, the{" "}
              <span className="font-bold"> Restrict Websocket Pool </span>flag
              and restart browser will help.
            </p>
          </div>
          {/*-- Modal footer */}
          <div
            className={`${
              isOptions ? "justify-start" : "justify-between"
            }" flex pt-2 pb-4 px-4 space-x-2 border-gray-200 dark:border-gray-600"`}
          >
            <button
              type="button"
              onClick={() => {
                // TODO: this should produce a react-style event instead of setting the value directly
                setShowModal(false)
                environment.set({ type: "braveSetting" }, true)
              }}
              className="text-gray-500 bg-white hover:bg-gray-100 focus:outline-none rounded-lg border border-gray-200 text-xs font-medium px-2.5 py-1.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
            >
              Dismiss
            </button>
            <button
              onClick={() => {
                openInNewTab(
                  "https://docs.substrate.io/fundamentals/light-clients-in-substrate-connect/#brave-browser-websocket-issue",
                )
              }}
              type="button"
              className="text-gray-500 bg-white hover:bg-gray-100 focus:outline-none rounded-lg border border-gray-200 text-xs font-medium px-2.5 py-1.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
            >
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
