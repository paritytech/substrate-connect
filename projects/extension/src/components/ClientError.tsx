import React from "react"

interface Props {
  error: string
}

export const ClientError = ({ error }: Props) => {
  return (
    <div className="text-base break-words block my-3 mx-6 justify-between pt-1.5 leading-4">
      Smoldot light client has panicked with error:{" "}
      <span
        onClick={() => navigator.clipboard.writeText(error)}
        className="cursor-pointer inline text-red-500 font-bold"
      >
        "{error}"
      </span>
      .Please copy the error message by clicking it or at the link below, and
      open a new bug issue at the
      <a
        className="underline inline pl-2 font-bold"
        href="https://github.com/paritytech/smoldot/issues/new"
        target="_blank"
      >
        Smoldot light client repository.
      </a>
    </div>
  )
}
