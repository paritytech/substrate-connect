import { MdOutlineEast } from "react-icons/md"

export const Footer = () => (
  <>
    <div className="border-t border-neutral-200 mx-8" />
    <div className="pl-8 pr-6 hover:bg-stone-200">
      <button
        className="font-inter flex w-full justify-between py-3.5 text-sm font-light capitalize"
        onClick={() =>
          window.open("https://substrate.io/developers/substrate-connect/")
        }
      >
        <div className="text-lg font-inter font-normal">About</div>
        <div className="tooltip">
          <span className="p-4 text-xs shadow-lg tooltiptext tooltip_left">
            Go to Substrate.io - Substrate-connect
          </span>
          <MdOutlineEast className="text-xl" />
        </div>
      </button>
    </div>
  </>
)
