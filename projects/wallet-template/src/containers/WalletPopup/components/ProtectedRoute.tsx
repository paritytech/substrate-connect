import { ReactNode } from "react"
import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useKeyring } from "../hooks"

export const ProtectedRoute = ({ children }: { children?: ReactNode }) => {
  const { isLocked } = useKeyring()
  const location = useLocation()
  return isLocked ? (
    <Navigate
      to="/unlock-keyring"
      replace
      state={{ from: location, pathname: location.pathname }}
    />
  ) : (
    children ?? <Outlet />
  )
}
