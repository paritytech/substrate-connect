import { ReactNode, createContext, useContext } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import useSWR from "swr"
import { rpc } from "../api"

type Context = {
  isLocked: boolean
  unlock(password: string): Promise<void>
  lock(): Promise<void>
  refresh(): Promise<void>
}

const LockContext = createContext({} as Context)

export const KeyringProvider = ({ children }: { children?: ReactNode }) => {
  const {
    data: isLocked,
    isLoading,
    error,
    mutate,
  } = useSWR("rpc.isKeyringLocked", () => rpc.client.isKeyringLocked())
  const navigate = useNavigate()
  const location = useLocation()
  // FIXME: on error, navigate to error page
  if (isLoading || error) return null
  const refresh = async () => {
    await mutate()
  }
  const unlock = async (password: string) => {
    await rpc.client.unlockKeyring(password)
    await refresh()
    navigate(location.state?.from?.pathname || "/")
  }
  const lock = async () => {
    await rpc.client.lockKeyring()
    await refresh()
    navigate("/unlock-keyring", { replace: true })
  }
  const value = {
    isLocked: isLocked!,
    unlock,
    lock,
    refresh,
  }
  return <LockContext.Provider value={value}>{children}</LockContext.Provider>
}

export const useKeyring = () => useContext(LockContext)
