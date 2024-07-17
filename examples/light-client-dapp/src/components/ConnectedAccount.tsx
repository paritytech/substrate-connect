import type { ReactEventHandler } from "react"
import {
  ModalProvider,
  useModal,
  useSystemAccount,
  useUnstableProvider,
} from "../hooks"

export const ConnectedAccount = () => {
  return (
    <ModalProvider>
      <Account />
      <Modal />
    </ModalProvider>
  )
}

const Account = () => {
  const { account, disconnectAccount } = useUnstableProvider()
  const { handleOpen } = useModal()
  const systemAccount = useSystemAccount()
  const balance = !account ? "N/A" : (systemAccount?.data.free ?? 0n)
  return (
    <article>
      <header>
        <nav>
          <ul>
            <li>Account</li>
          </ul>
          <ul>
            <li>
              {account ? (
                <button
                  className="outline secondary"
                  onClick={(e) => {
                    disconnectAccount()
                    handleOpen(e)
                  }}
                >
                  Disconnect Account
                </button>
              ) : (
                <button className="primary" onClick={handleOpen}>
                  Connect Account
                </button>
              )}
            </li>
          </ul>
        </nav>
      </header>
      {account ? (
        <>
          <div style={{ fontFamily: "monospace" }}>{account.address}</div>
          <small>Balance: {`${balance}`}</small>
        </>
      ) : (
        <div>No account connected</div>
      )}
    </article>
  )
}

const Modal = () => {
  const { modalIsOpen, handleClose } = useModal()
  const { provider } = useUnstableProvider()
  return (
    <dialog
      onClick={(event) => {
        if (event.target === event.currentTarget) handleClose(event)
      }}
      open={modalIsOpen}
    >
      {!provider ? (
        <SelectProvider onClose={handleClose} />
      ) : (
        <SelectAccount onClose={handleClose} />
      )}
    </dialog>
  )
}

type SelectProviderProps = {
  onClose: ReactEventHandler
}
const SelectProvider = ({ onClose }: SelectProviderProps) => {
  const { providerDetails, connectProviderDetail } = useUnstableProvider()
  if (!providerDetails) return null
  return (
    <article>
      <header>
        <button aria-label="Close" rel="prev" onClick={onClose}></button>
        <h4>Select Provider</h4>
      </header>
      <div>
        {providerDetails.length > 0 ? (
          providerDetails.map((p) => (
            <div
              key={p.info.uuid}
              role="button"
              style={{ marginBottom: "1rem" }}
              onClick={() => connectProviderDetail(p)}
            >
              {p.info.name}
            </div>
          ))
        ) : (
          <div>No providers available</div>
        )}
      </div>
    </article>
  )
}

type SelectAccountProps = {
  onClose: ReactEventHandler
}
const SelectAccount = ({ onClose }: SelectAccountProps) => {
  const { accounts, connectAccount, disconnectProviderDetail } =
    useUnstableProvider()
  return (
    <article>
      <header>
        <button aria-label="Close" rel="prev" onClick={onClose}></button>
        <h4>Select Account</h4>
      </header>
      <div>
        {accounts && accounts.length > 0 ? (
          accounts.map((account) => (
            <div
              key={account.address}
              role="button"
              style={{ marginBottom: "1rem", fontFamily: "monospace" }}
              onClick={(e) => {
                connectAccount(account)
                onClose(e)
              }}
            >
              {account.address}
            </div>
          ))
        ) : (
          <div>No accounts available</div>
        )}
      </div>
      <footer>
        <button
          className="secondary outline"
          onClick={() => disconnectProviderDetail()}
        >
          Change Provider
        </button>
      </footer>
    </article>
  )
}
