import { UploadCloud, CheckCircle } from "lucide-react"

export const Chainspecs = () => {
  return (
    <div className="max-w-xl mx-auto p-4">
      <header className="text-center">
        <h1 className="text-2xl font-bold">Chainspec Configuration</h1>
        <p className="text-sm text-gray-600 mt-1">
          Add your chainspec file for the blockchain network settings.
        </p>
      </header>

      <div className="mt-6">
        <section aria-labelledby="manual-entry-heading">
          <h2 id="manual-entry-heading" className="font-semibold">
            Enter Chainspec Manually
          </h2>
          <textarea
            className="w-full border border-gray-200 rounded-md p-2 mt-2"
            aria-label="Manual chainspec input"
            placeholder="Paste your chainspec here..."
            rows={8}
          ></textarea>
        </section>

        <div className="mt-4 flex justify-center items-center">
          <button className="border border-gray-300 text-gray-600 py-2 px-4 rounded hover:bg-gray-100">
            Submit Chainspec
          </button>
        </div>

        <section aria-labelledby="upload-heading" className="mt-8">
          <h2 id="upload-heading" className="font-semibold">
            Or Upload a File
          </h2>
          <label htmlFor="file-upload" className="cursor-pointer mt-2 block">
            <div className="flex justify-center items-center p-4 border border-dashed border-gray-300 rounded text-gray-600 hover:bg-gray-100">
              <UploadCloud className="mr-2" />
              Click to upload chainspec file
            </div>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              aria-label="File upload input"
            />
          </label>
        </section>

        <div className="mt-4 flex justify-center items-center">
          <button className="border border-gray-300 text-gray-600 py-2 px-4 rounded hover:bg-gray-100">
            Upload and Submit File
          </button>
        </div>
      </div>

      <footer className="mt-8 text-center">
        <div className="inline-flex items-center text-green-600">
          <CheckCircle className="mr-2" />
          File successfully submitted
        </div>
      </footer>
    </div>
  )
}
