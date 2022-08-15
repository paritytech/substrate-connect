import React, {
  FunctionComponent,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react"

import { MdOutlineSettings, MdOutlineEast, MdLinkOff } from "react-icons/md"
import { Accordion, Logo } from "../components"
import { Background } from "../background"
import IconWeb3 from "../components/IconWeb3"
import { BraveModal } from "../components/BraveModal"

interface PopupChain {
  chainName: string
  details: ChainDetails[]
}

interface ChainDetails {
  tabId?: number
  url?: string
  peers: number
  isSyncing: boolean
  chainId: string
}

const Popup: FunctionComponent = () => {
  const disconnectTab = useRef<(tabId: number) => void>((_: number) => {})
  const [connChains, setConnChains] = useState<PopupChain[] | undefined>()

  const [bg, setBg] = useState<Background | undefined>()
  const [showModal, setShowModal] = useState<boolean>(false)

  const refresh = () => {
    const allChains: PopupChain[] = []

    bg?.uiInterface.chains.forEach((c) => {
      const i = allChains.findIndex((i) => i.chainName === c.chainName)
      if (i === -1) {
        allChains.push({
          chainName: c.chainName,
          details: [
            {
              tabId: c.tab?.id,
              url: c.tab?.url,
              peers: c.peers,
              isSyncing: c.isSyncing,
              chainId: c.chainId,
            },
          ],
        })
      } else {
        const details = allChains[i]?.details
        if (!details.map((d) => d.tabId).includes(c.tab?.id)) {
          details.push({
            tabId: c.tab?.id,
            url: c.tab?.url,
            peers: c.peers,
            isSyncing: c.isSyncing,
            chainId: c.chainId,
          })
        }
      }
    })
    setConnChains([...allChains])
  }

  useEffect(() => {
    chrome.runtime.getBackgroundPage((backgroundPage) => {
      setBg(backgroundPage as Background)
    })
  }, [])

  useEffect(() => {
    if (!bg) return

    // Identify Brave browser and show Popup
    window.navigator?.brave?.isBrave().then(async (isBrave: any) => {
      setShowModal(isBrave && !bg.uiInterface.extSettings.braveSetting)
    })

    disconnectTab.current = bg.uiInterface.disconnectTab
    const unsubscribe = bg.uiInterface.onChainsChanged(() => refresh())
    refresh()

    return unsubscribe
  }, [bg])

  const goToOptions = (): void => {
    chrome.runtime.openOptionsPage()
  }

  const networkIcon = (network: string) => {
    const icon = network.toLowerCase()
    return (
      <>
        <IconWeb3>{icon}</IconWeb3>
        <div className="pl-2">{network}</div>
      </>
    )
  }

  const onDisconnect = (tabId: number): void => {
    disconnectTab.current(tabId)
    refresh()
  }

  return (
    <>
      <BraveModal show={showModal} />
      <main className="w-80">
        <header className="my-3 mx-6 flex justify-between border-b border-neutral-200 pt-1.5 pb-4 leading-4">
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
        <div className="pb-3.5">
          {connChains?.map((w) => {
            if (w?.details?.length === 1 && !w?.details[0].tabId)
              return (
                <>
                  <div key={w.chainName} className="pl-6 flex text-lg">
                    {networkIcon(w.chainName)}
                  </div>
                  <div className="pl-16 flex pb-4 text-[#616161]">
                    No apps connected
                  </div>
                </>
              )
            const contents: ReactNode[] = []
            w?.details?.forEach((t) => {
              if (t.tabId) {
                contents.push(
                  <div key={t.url} className="flex justify-between">
                    <div className="ml-6 w-full truncate text-base">
                      {t.url}
                    </div>

                    <div
                      className="tooltip"
                      onClick={() => t && t.tabId && onDisconnect(t.tabId)}
                    >
                      <span className="p-4 text-xs shadow-lg tooltiptext tooltip_left">
                        Disconnect tab
                      </span>
                      <MdLinkOff className="ml-2 text-base cursor-pointer hover:bg-gray-200" />
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
                  <div className="flex justify-between items-center w-full">
                    <div className="pl-4 flex text-lg justify-start">
                      {networkIcon(w.chainName)}
                      <span className="pl-2 text-[#616161]">
                        ({contents.length})
                      </span>
                    </div>
                  </div>,
                ]}
                contents={[<>{contents}</>]}
                showTitleIcon={!!contents.length}
              />
            )
          })}
        </div>
        <div className="border-t border-neutral-200 mx-8" />
        <div className="pl-8 pr-6 hover:bg-stone-200">
          <button
            className="font-inter flex w-full justify-between py-3.5 text-sm font-light capitalize"
            onClick={() =>
              window.open(
                "https://paritytech.github.io/substrate-connect/#extension",
              )
            }
          >
            <div className="text-lg font-inter font-normal">About</div>
            <div className="tooltip">
              <span className="p-4 text-xs shadow-lg tooltiptext tooltip_left">
                Go to Landing Page
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
