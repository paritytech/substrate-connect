import { useForm, SubmitHandler } from "react-hook-form"
import { useKeyring } from "../hooks"
import { Layout } from "../../../components/Layout"

type FormFields = {
  password: string
}

export const UnlockKeyring = () => {
  const { unlock } = useKeyring()
  const {
    register,
    handleSubmit,
    setError,
    formState: { isSubmitting, errors },
  } = useForm<FormFields>()
  const onSubmit: SubmitHandler<FormFields> = ({ password }) => unlock(password)

  return (
    <Layout>
      <div className="my-4 h-80 flex justify-center items-center">
        <h1 className="text-3xl font-bold text-center">Unlock Wallet</h1>
      </div>
      <form
        onSubmit={(e) =>
          handleSubmit(onSubmit)(e).catch((e) =>
            setError("password", { message: e.message ?? "Invalid password" }),
          )
        }
      >
        <div className="my-4">
          <input
            type="password"
            placeholder="Enter password"
            className="w-full p-3 text-lg border rounded"
            autoFocus
            {...register("password")}
          />
          {errors.password && (
            <div className="text-red-500">{errors.password.message}</div>
          )}
        </div>
        <div className="my-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full p-3 text-lg rounded border border-[#24cc85] text-[#24cc85] hover:text-white hover:bg-[#24cc85]"
          >
            {isSubmitting ? "Unlocking..." : "Unlock"}
          </button>
        </div>
      </form>
    </Layout>
  )
}
