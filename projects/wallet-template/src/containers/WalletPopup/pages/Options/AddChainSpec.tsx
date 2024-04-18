import React from "react"
import { useForm, SubmitHandler } from "react-hook-form"
import { CheckCircle, Loader } from "lucide-react"

import { rpc } from "../../api"

type FormFields = {
  chainSpec: string
}

export const AddChainSpec: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors, isSubmitted, isSubmitSuccessful },
  } = useForm<FormFields>()
  const onSubmit: SubmitHandler<FormFields> = async ({ chainSpec }) => {
    await rpc.client.addChainSpec(chainSpec)
  }

  return (
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
  )
}
