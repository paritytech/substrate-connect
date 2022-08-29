import React from "react"

export const ChainsError = () => {
  return (
    <div className="block my-3 mx-6 justify-between pt-1.5 leading-4">
      There are no networks running inside extension at the moment. This,
      probably, means that Smoldot light client has panicked. Please, check the
      logs of extension's background script at the console and open an issue at
      <a
        className="text-red-500 font-bold inline pl-2"
        href="https://github.com/paritytech/substrate-connect/issues"
        target="_blank"
      >
        Substrate Connect repository.
      </a>
    </div>
  )
}
