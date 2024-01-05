import { type RawChain } from "@substrate/light-client-extension-helpers/web-page"
import { FC } from "react"
import { useChain } from "../hooks/useChain"

type Props = {
  chain: RawChain
}

export const Chain: FC<Props> = ({ chain }) => {
  const { finalized, blockHeight } = useChain(chain)
  return (
    <article data-testid={`chain${chain.name}`}>
      <header>{chain.name}</header>
      {finalized && blockHeight ? (
        <>
          <div>
            Latest Finalized Block{" "}
            <strong data-testid={"blockHeight"} data-blockheight={blockHeight}>
              {formatNumber(blockHeight)}
            </strong>
          </div>
          <pre>{finalized}</pre>
        </>
      ) : (
        <span aria-busy="true">synchronizing, please wait...</span>
      )}
    </article>
  )
}

const numberFormat = new Intl.NumberFormat()
const formatNumber = (number: number) => numberFormat.format(number)
