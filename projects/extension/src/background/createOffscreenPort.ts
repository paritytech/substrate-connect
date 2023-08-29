let port: chrome.runtime.Port | undefined
export async function createOffscreenPort() {
  await setupOffscreenDocument("offscreen.html")
  if (!port) {
    port = chrome.runtime.connect({ name: "offscreen" })
    port.onDisconnect.addListener(() => {
      port = undefined
    })
  }
  return port
}

let creatingOffscreenDocument: Promise<void> | undefined = undefined
async function setupOffscreenDocument(url: string) {
  // Check all windows controlled by the service worker to see if one
  // of them is the offscreen document with the given path
  if (!creatingOffscreenDocument && (await hasOffscreenDocument(url))) return

  // create offscreen document
  if (creatingOffscreenDocument) {
    await creatingOffscreenDocument
  } else {
    creatingOffscreenDocument = chrome.offscreen.createDocument({
      url,
      reasons: [chrome.offscreen.Reason.WORKERS],
      justification: "instantiate smoldot in a different thread",
    })
    await creatingOffscreenDocument
    creatingOffscreenDocument = undefined
  }
}

async function hasOffscreenDocument(path: string) {
  const offscreenUrl = chrome.runtime.getURL(path)
  // TODO: fix TS, chrome.runtime.getContexts was added in Chrome 116
  if (chrome.runtime.getContexts) {
    const existingContexts = await chrome.runtime.getContexts({
      contextTypes: ["OFFSCREEN_DOCUMENT"],
      documentUrls: [offscreenUrl],
    })
    return existingContexts.length > 0
  }
  // TODO: fix TS, clients is a service worker object
  const matchedClients = await clients.matchAll()

  for (const client of matchedClients) {
    if (client.url === offscreenUrl) {
      return true
    }
  }
  return false
}
