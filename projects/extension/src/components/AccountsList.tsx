import { AccountCard } from "@polkadot-cloud/react"
import {
  EllipsisProps,
  IconProps,
  TitleProps,
} from "@polkadot-cloud/react/recipes/AccountCard"

const make = (length: number) => {
  var result = ""
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  var charactersLength = characters.length
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

const titleProps: TitleProps = {
  // name: make(Math.random() * (12 - 6) + 6),
  address: make(32),
}

const ellipsisProps: EllipsisProps = {
  active: true,
  position: "center",
  amount: 13,
}

const iconProps: IconProps = {
  size: 32,
  copy: true,
  position: "left",
  dark: false,
  gridSize: 2,
  justify: "flex-start",
}

export const AccountsList = () => {
  return (
    <div className="px-4 py-5 flex-auto">
      {/* TODO: Fix The accounts */}
      <div style={{ width: "100%" }}>
        <AccountCard
          style={{ margin: "0.5rem 0" }}
          title={Object.assign({}, titleProps, {
            address: "5FsfHTe8DyyXiAo6AAubX8CS5KWjvKaENf5c8iXr52cJn6B3",
          })}
          ellipsis={ellipsisProps}
          icon={iconProps}
        />
        <AccountCard
          style={{ margin: "0.5rem 0" }}
          title={Object.assign({}, titleProps, {
            address: "5FUB8bMYR3yu8dK7uiYTg96kQqQmCWK12LTRmQK8phVfXKvf",
          })}
          ellipsis={ellipsisProps}
          icon={iconProps}
        />
        <AccountCard
          style={{ margin: "0.5rem 0" }}
          title={Object.assign({}, titleProps, {
            address: "14tr1o5qdDUEywX8s2HDxoj6UJNPMcE6yphvYpUQ5GdTxcAN",
          })}
          ellipsis={ellipsisProps}
          icon={iconProps}
        />
      </div>
    </div>
  )
}
