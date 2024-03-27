import { ReactNode } from "react"
import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useKeyring } from "../hooks"

export const ProtectedRoute = ({ children }: { children?: ReactNode }) => {
  const {
    keyring: { isLocked, hasPassword },
  } = useKeyring()
  const location = useLocation()
  return !hasPassword ? (
    <Navigate to="/welcome" replace />
  ) : isLocked ? (
    <Navigate
      to="/unlock-keyring"
      replace
      state={{ from: location, pathname: location.pathname }}
    />
  ) : (
    children ?? <Outlet />
  )
}
