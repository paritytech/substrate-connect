import { Link } from "react-router-dom"
import { useKeyring } from "../hooks"
import { Layout } from "../../../components/Layout"

export const Debug = () => {
  const { lock } = useKeyring()
  return (
    <Layout>
      <h1 className="text-3xl font-bold">Wallet</h1>
      <div className="my-4 flex space-x-4">
        <Link
          to={"/accounts"}
          className="py-1.5 px-8 text-sm rounded border border-[#24cc85] text-[#24cc85] hover:text-white hover:bg-[#24cc85]"
        >
          Accounts
        </Link>
      </div>
      <div className="my-4 flex space-x-4">
        <Link
          to={"/change-password"}
          className="py-1.5 px-8 text-sm rounded border border-[#24cc85] text-[#24cc85] hover:text-white hover:bg-[#24cc85]"
        >
          Change Password
        </Link>
        <button
          onClick={() => lock()}
          className="py-1.5 px-8 text-sm rounded border border-[#24cc85] text-[#24cc85] hover:text-white hover:bg-[#24cc85]"
        >
          Lock
        </button>
      </div>
    </Layout>
  )
}
