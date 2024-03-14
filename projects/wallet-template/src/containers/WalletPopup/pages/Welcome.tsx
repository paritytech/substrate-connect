import { Navigate } from "react-router-dom"
import { useForm, SubmitHandler } from "react-hook-form"

import { rpc } from "../api"
import { useKeyring } from "../hooks"

type FormFields = {
  password: string
  passwordConfirm: string
}

export const Welcome = () => {
  const { refresh } = useKeyring()
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { isSubmitting, errors, isSubmitSuccessful },
    watch,
  } = useForm<FormFields>()
  const onSubmit: SubmitHandler<FormFields> = async ({ password }) => {
    await rpc.client.createPassword(password)
    await refresh()
    reset()
  }
  return (
    <div>
      {isSubmitSuccessful && <Navigate to="/" replace={true} />}
      <div className="my-4">
        <h1 className="text-3xl font-bold text-center">Welcome</h1>
      </div>
      <div className="mt-12 mb-4">
        <h1 className="text-xl font-bold text-center">Create password</h1>
      </div>
      <form
        onSubmit={(e) =>
          handleSubmit(onSubmit)(e).catch((e) =>
            setError("root", {
              message: e.message ?? "Error creating password",
            }),
          )
        }
      >
        <div className="my-4">
          <input
            type="password"
            placeholder="Enter password"
            className="w-full p-3 text-lg border rounded"
            disabled={isSubmitting}
            autoFocus
            {...register("password", {
              required: "You must specify a password",
              minLength: {
                value: 6,
                message: "Password must have at least 6 characters",
              },
            })}
          />
          {errors.password && (
            <div className="text-red-500">{errors.password.message}</div>
          )}
        </div>
        <div className="my-4">
          <input
            type="password"
            placeholder="Confirm password"
            className="w-full p-3 text-lg border rounded"
            disabled={isSubmitting}
            {...register("passwordConfirm", {
              required: "You must confirm the password",
              validate: (value) =>
                value === watch("password") || "The passwords do not match",
            })}
          />
          {errors.passwordConfirm && (
            <div className="text-red-500">{errors.passwordConfirm.message}</div>
          )}
        </div>
        <div className="my-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full p-3 text-lg rounded border border-[#24cc85] text-[#24cc85] hover:text-white hover:bg-[#24cc85]"
          >
            {isSubmitting ? "Creating password..." : "Create password"}
          </button>
          <div className="mt-2 text-red-500">
            {errors.root && (
              <div className="text-red-500">{errors.root.message}</div>
            )}
          </div>
        </div>
        {isSubmitSuccessful && (
          <div className="my-4">Password created succesfully</div>
        )}
      </form>
    </div>
  )
}
