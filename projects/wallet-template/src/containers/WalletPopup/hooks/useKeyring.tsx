import { ReactNode, createContext, useContext } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import useSWR from "swr"
import { rpc } from "../api"
import { z } from "zod"

type Context = {
  keyring: {
    isLocked: boolean
    hasPassword: boolean
  }
  unlock(password: string): Promise<void>
  lock(): Promise<void>
  refresh(): Promise<void>
}

const LocationStateSchema = z.object({
  pathname: z.string(),
  search: z.string().optional(),
})

const LockContext = createContext({} as Context)

export const KeyringProvider = ({ children }: { children?: ReactNode }) => {
  const {
    data: keyring,
    isLoading,
    error,
    mutate,
  } = useSWR("rpc.getKeyringState", () => rpc.client.getKeyringState())
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

    const locationResult = LocationStateSchema.safeParse(location.state)
    if (locationResult.success) {
      console.log("locationResult.data.pathName", locationResult.data.pathname)
      navigate({
        pathname: locationResult.data.pathname,
        search: locationResult.data.search,
      })
    } else {
      navigate("/")
    }
  }
  const lock = async () => {
    await rpc.client.lockKeyring()
    await refresh()
    navigate("/unlock-keyring")
  }
  const value = {
    keyring: keyring!,
    unlock,
    lock,
    refresh,
  }
  return <LockContext.Provider value={value}>{children}</LockContext.Provider>
}

export const useKeyring = () => useContext(LockContext)
