import { useActor, useMachine, normalizeProps, PropTypes } from "@zag-js/react"
import * as toast from "@zag-js/toast"
import { createContext, useContext } from "react"

type ToastProps = {
  actor: toast.Service
}

const Toast: React.FC<ToastProps> = (props) => {
  const [state, send] = useActor(props.actor)
  const api = toast.connect(state, send, normalizeProps)

  return (
    <div
      {...api.rootProps}
      style={{
        backgroundColor: "white",
        padding: "1rem",
        borderWidth: "0.125rem",
        borderStyle: "solid",
        borderColor: "black",
      }}
    >
      <h3 {...api.titleProps}>{api.title}</h3>
      <p {...api.descriptionProps}>{api.description}</p>
      <button onClick={api.dismiss}>Close</button>
    </div>
  )
}

type Toast = toast.GroupApi<PropTypes, unknown>
const ToastContext = createContext<Toast>({} as Toast)
export const useToast = () => useContext(ToastContext)

export const ToastProvider: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const [state, send] = useMachine(toast.group.machine({ id: "1" }))

  const api = toast.group.connect(state, send, normalizeProps)

  return (
    <ToastContext.Provider value={api}>
      {api.getPlacements().map((placement) => (
        <div key={placement} {...api.getGroupProps({ placement })}>
          {api.getToastsByPlacement(placement).map((toast) => (
            <Toast key={toast.id} actor={toast} />
          ))}
        </div>
      ))}
      {children}
    </ToastContext.Provider>
  )
}
