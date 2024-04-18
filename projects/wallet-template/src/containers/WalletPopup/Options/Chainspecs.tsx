import { useForm, SubmitHandler } from "react-hook-form"
import { rpc } from "../api"
import { CheckCircle, Loader } from "lucide-react"
import * as tabs from "@zag-js/tabs"
import { useMachine, normalizeProps } from "@zag-js/react"
import { useId } from "react"

type FormFields = {
  chainSpec: string
}

const data = [
  { value: "list", label: "List" },
  { value: "add", label: "Add" },
  { value: "remove", label: "Remove" },
] as const

export const Chainspecs = () => {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors, isSubmitted, isSubmitSuccessful },
  } = useForm<FormFields>()
  const [state, send] = useMachine(tabs.machine({ id: useId(), value: "list" }))

  const api = tabs.connect(state, send, normalizeProps)

  const onSubmit: SubmitHandler<FormFields> = async ({ chainSpec }) => {
    await rpc.client.addChainSpec(chainSpec)
  }

  return (
    <div className="max-w-xl mx-auto p-4">
      <header className="text-center">
        <h1 className="text-2xl font-bold">
          Chain Specification Configuration
        </h1>
      </header>

      <div {...api.rootProps}>
        <div className="flex justify-around my-4" {...api.listProps}>
          {data.map((item) => (
            <button
              {...api.getTriggerProps({ value: item.value })}
              key={item.value}
              className={`px-4 py-2 font-semibold rounded-md ${api.value === item.value ? "bg-blue-500 text-white" : "bg-gray-100"}`}
            >
              {item.label}
            </button>
          ))}
        </div>
        {data.map((item) => (
          <div
            {...api.getContentProps({ value: item.value })}
            className="mt-6"
            key={item.value}
          >
            <section aria-labelledby="manual-entry-heading">
              <h2 id="manual-entry-heading" className="font-semibold">
                Enter Chain Specification
              </h2>
              <form onSubmit={handleSubmit(onSubmit)}>
                <textarea
                  {...register("chainSpec", {
                    required: "You must specify a chain specification",
                  })}
                  className="w-full border border-gray-200 rounded-md p-2 mt-2"
                  aria-label="Manual chainspec input"
                  placeholder="Paste your chain specification here..."
                  rows={8}
                ></textarea>
                {errors.chainSpec && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.chainSpec.message}
                  </p>
                )}

                <div className="mt-4 flex justify-center items-center">
                  <button
                    type="submit"
                    className="border border-gray-300 text-gray-600 py-2 px-4 rounded hover:bg-gray-100 flex items-center disabled:opacity-50"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader className="animate-spin h-5 w-5 mr-3" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Chain Specification"
                    )}
                  </button>
                </div>
                {isSubmitted && isSubmitSuccessful && (
                  <p className="text-green-500 text-center mt-2">
                    <CheckCircle className="inline-block mr-2" />
                    Chain specification submitted successfully.
                  </p>
                )}
                {isSubmitted && !isSubmitSuccessful && (
                  <p className="text-red-500 text-center mt-2">
                    Error submitting chain specification.
                  </p>
                )}
              </form>
            </section>
          </div>
        ))}
      </div>
    </div>
  )
}
