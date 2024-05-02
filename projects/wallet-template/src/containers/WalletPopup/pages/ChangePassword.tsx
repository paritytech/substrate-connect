import { useForm, SubmitHandler } from "react-hook-form"
import { rpc } from "../api"
import { Layout } from "../../../components/Layout"

type FormFields = {
  currentPassword: string
  newPassword: string
  newPasswordConfirm: string
}

export const ChangePassword = () => {
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { isSubmitting, errors, isSubmitSuccessful },
    watch,
  } = useForm<FormFields>()
  const onSubmit: SubmitHandler<FormFields> = async ({
    currentPassword,
    newPassword,
  }) => {
    await rpc.client.changePassword(currentPassword, newPassword)
    reset()
  }
  return (
    <Layout>
      <div className="my-4">
        <h1 className="text-3xl font-bold text-center">Change Password</h1>
      </div>
      <form
        onSubmit={(e) =>
          handleSubmit(onSubmit)(e).catch((e) =>
            setError("root", {
              message: e.message ?? "Error updating password",
            }),
          )
        }
      >
        <div className="my-4">
          <input
            type="password"
            placeholder="Enter old password"
            className="w-full p-3 text-lg border rounded"
            autoFocus
            {...register("currentPassword", {
              required: "You must specify a password",
              minLength: {
                value: 6,
                message: "Password must have at least 6 characters",
              },
            })}
          />
          {errors.currentPassword && (
            <div className="text-red-500">{errors.currentPassword.message}</div>
          )}
        </div>
        <div className="my-4">
          <input
            type="password"
            placeholder="Enter new password"
            className="w-full p-3 text-lg border rounded"
            {...register("newPassword", {
              required: "You must specify a password",
              minLength: {
                value: 6,
                message: "Password must have at least 6 characters",
              },
            })}
          />
          {errors.newPassword && (
            <div className="text-red-500">{errors.newPassword.message}</div>
          )}
        </div>
        <div className="my-4">
          <input
            type="password"
            placeholder="Re-enter new password"
            className="w-full p-3 text-lg border rounded"
            {...register("newPasswordConfirm", {
              required: "You must confirm the password",
              validate: (value) =>
                value === watch("newPassword") || "The passwords do not match",
            })}
          />
          {errors.newPasswordConfirm && (
            <div className="text-red-500">
              {errors.newPasswordConfirm.message}
            </div>
          )}
        </div>
        <div className="my-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full p-3 text-lg rounded border border-[#24cc85] text-[#24cc85] hover:text-white hover:bg-[#24cc85]"
          >
            {isSubmitting ? "Changing password..." : "Change password"}
          </button>
          <div className="mt-2 text-red-500">
            {errors.root && (
              <div className="text-red-500">{errors.root.message}</div>
            )}
          </div>
        </div>
        {isSubmitSuccessful && (
          <div className="my-4">Password updated successfully</div>
        )}
      </form>
    </Layout>
  )
}
