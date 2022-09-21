import React, { useEffect, useState } from "react"
import { MdOutlineContentCopy } from "react-icons/md"

interface Props {
  error?: string
}

export const ClientError = ({ error }: Props) => {
  const [showCopied, setShowCopied] = useState<boolean>(false)

  useEffect(() => {
    let tm: NodeJS.Timeout
    if (showCopied) {
      tm = setTimeout(() => {
        setShowCopied(false)
      }, 1000)
    }
    return () => clearTimeout(tm)
  }, [showCopied])

  return (
    <div className="break-words block my-3 mx-6 justify-between pt-1.5 leading-4">
      Smoldot light client has panicked with error:{" "}
      <span className="inline text-red-500 font-bold">"{error}"</span>
      <span className="inline-block mx-2 cursor-pointer">
        <MdOutlineContentCopy
          className="text-base hover:text-green-800"
          onClick={() => {
            if (error) {
              navigator.clipboard.writeText(error)
              setShowCopied(true)
            }
          }}
        />
        {showCopied && (
          <div className="animate-bounce p-2 bg-green-500 w-40 text-white rounded-lg absolute left-0 right-0 align-center m-[auto] top-[5%]">
            Error Message Copied
          </div>
        )}
      </span>
      . Please open a new bug issue in the
      <a
        rel="noopener noreferrer"
        className="underline inline pl-2 font-bold"
        href="https://github.com/paritytech/smoldot/issues/new"
        target="_blank"
      >
        smoldot repository.
      </a>
    </div>
  )
}
