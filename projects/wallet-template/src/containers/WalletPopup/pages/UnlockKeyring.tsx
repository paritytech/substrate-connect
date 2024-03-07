import { useKeyring } from "../hooks"

export const UnlockKeyring = () => {
  const { unlock } = useKeyring()
  return (
    <div>
      <h1>Unlocking in 2s...</h1>
      <button onClick={() => unlock("123456")}>Unlock</button>
    </div>
  )
}
