import { FunctionComponent, ReactNode, useEffect, useState } from "react"

import { MdOutlineSettings, MdOutlineEast } from "react-icons/md"
import { Accordion, Logo, IconWeb3, BraveModal } from "../components"
import * as environment from "../environment"
import { useActiveChains } from "../hooks/useActiveChains"

const goToOptions = (): void => {
  chrome.runtime.openOptionsPage()
}

const networkIcon = (network: string, isWellKnown: boolean) => {
  const icon = network.toLowerCase()
  return (
    <>
      <IconWeb3 isWellKnown={isWellKnown}>{icon}</IconWeb3>
      <div className="pl-2">{network}</div>
    </>
  )
}

const Popup: FunctionComponent = () => {
  const chains = useActiveChains()
  const [showModal, setShowModal] = useState<boolean>(false)

  useEffect(() => {
    // Identify Brave browser and show Popup
    window.navigator?.brave?.isBrave().then(async (isBrave: any) => {
      const braveSetting = await environment.get({ type: "braveSetting" })
      setShowModal(isBrave && !braveSetting)
    })
  }, [])

  console.log(">>>", chains)

  return (
    <>
      <BraveModal show={showModal} />
      <main className="w-80">
        <header className="mt-3 mx-8 flex justify-between border-b border-neutral-200 pt-1.5 pb-4 leading-4">
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
        <div className={!chains?.length ? "" : "pb-3.5"}>
          {!chains?.length ? (
            <div className="mx-8 my-8">
              The extension isn't connected to any network.
            </div>
          ) : (
            chains?.map((c) => {
              if (c?.details?.length === 1 && !c?.details[0].tabId)
                return (
                  <>
                    <div className="block mt-4">
                      <div key={c.chainName} className="pl-6 flex text-lg">
                        {networkIcon(c.chainName, c.isWellKnown)}
                      </div>
                      <div className="pl-[4.5rem] text-sm flex pt-2">
                        <span className="text-[#323232]">Latest block</span>
                        <span className="pl-2 text-[#24CC85]">
                          {c?.details[0].bestBlockHeight?.toLocaleString(
                            "en-US",
                          ) || "Syncing..."}
                        </span>
                      </div>
                    </div>
                    <div className="pl-[4.5rem] flex pt-2 pb-4 text-[#616161]">
                      No network
                    </div>
                  </>
                )
              const contents: ReactNode[] = []
              c?.details?.forEach((t) => {
                if (t.tabId) {
                  contents.push(
                    <div key={t.url} className="flex justify-between">
                      <div className="ml-8 text-sm w-full truncate text-base">
                        {t.url}
                      </div>
                    </div>,
                  )
                }
              })

              return (
                <Accordion
                  defaultAllExpanded={true}
                  titleClass="popup-accordion-title"
                  contentClass="popup-accordion-content"
                  titles={[
                    <div className="block mt-4">
                      <div className="pl-4 flex text-lg justify-start">
                        {networkIcon(c.chainName, c.isWellKnown)}
                        <span className="pl-2 text-[#616161]">
                          ({contents.length})
                        </span>
                      </div>
                      <div className="pl-16 flex pt-2">
                        <span className="text-[#323232]">Latest block</span>
                        <span className="pl-2 text-[#24CC85]">
                          {c?.details[0].bestBlockHeight?.toLocaleString(
                            "en-US",
                          ) || "Syncing..."}
                        </span>
                      </div>
                    </div>,
                  ]}
                  contents={[<>{contents}</>]}
                  showTitleIcon={!!contents.length}
                />
              )
            })
          )}
        </div>
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
      </main>
    </>
  )
}

export default Popup
