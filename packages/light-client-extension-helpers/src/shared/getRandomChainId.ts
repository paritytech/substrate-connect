export const getRandomChainId = () => {
  const arr = new BigUint64Array(2)
  // It can only be used from the browser, so this is fine.
  crypto.getRandomValues(arr)
  const result = (arr[1]! << BigInt(64)) | arr[0]!
  return result.toString(36)
}
