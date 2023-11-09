import { AccountCard } from "@polkadot-cloud/react"
import {
  EllipsisProps,
  IconProps,
  TitleProps,
} from "@polkadot-cloud/react/recipes/AccountCard"
import { IconWeb3 } from "./IconWeb3"

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
  justify: "flex-start",
}

const iconProps: IconProps = {
  size: 36,
  copy: true,
  position: "left",
  dark: false,
  gridSize: 2,
  justify: "flex-start",
}

const accountStyle = {
  margin: "0.5rem 0",
  padding: "1rem",
  backgroundColor: "white",
}

export const AccountsListOptions = () => {
  return (
    <section
      className="mx-0 md:mx-12 xl:mx-36 2xl:mx-36"
      style={{ width: "50%" }}
    >
      <div className="font-inter font-bold text-3xl pb-4">Accounts</div>
      {/* TODO: Fix The accounts */}
      <AccountCard
        fontSize="medium"
        style={accountStyle}
        icon={iconProps}
        title={Object.assign({}, titleProps, {
          address: "5FsfHTe8DyyXiAo6AAubX8CS5KWjvKaENf5c8iXr52cJn6B3",
        })}
        extraComponent={{
          component: <IconWeb3 isWellKnown>polkadot</IconWeb3>,
          position: "right",
          gridSize: 1,
        }}
      />
      <AccountCard
        fontSize="medium"
        style={accountStyle}
        icon={iconProps}
        title={Object.assign({}, titleProps, {
          address: "5FUB8bMYR3yu8dK7uiYTg96kQqQmCWK12LTRmQK8phVfXKvf",
        })}
        extraComponent={{
          component: <IconWeb3 isWellKnown>kusama</IconWeb3>,
          position: "right",
          gridSize: 1,
        }}
      />
      <AccountCard
        fontSize="medium"
        style={accountStyle}
        icon={iconProps}
        title={Object.assign({}, titleProps, {
          address: "14tr1o5qdDUEywX8s2HDxoj6UJNPMcE6yphvYpUQ5GdTxcAN",
        })}
        extraComponent={{
          component: <IconWeb3 isWellKnown>westend</IconWeb3>,
          position: "right",
          gridSize: 1,
        }}
      />
    </section>
  )
}
