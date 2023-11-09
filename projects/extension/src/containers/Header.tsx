import { MdOutlineSettings } from "react-icons/md"
import { Logo } from "../components"

export const Header = () => {
  const goToOptions = (): void => {
    chrome.runtime.openOptionsPage()
  }

  return (
    <header className="mt-3 mx-8 flex justify-between pt-1.5 pb-4 leading-4">
      <Logo textSize="xl" cName={"leading-4"} />
      <div className="tooltip">
        <span className="p-4 text-xs shadow-lg tooltiptext tooltip_left">
          Go to Options
        </span>
        <MdOutlineSettings
          onClick={goToOptions}
          className="text-xl leading-5 cursor-pointer hover:bg-gray-200"
        />
      </div>
    </header>
  )
}
