export type Account = {
  address: string
}

export type SignRequest = {
  url: string
  chainId: string
  address: string
  callData: string
}

export type BackgroundRpcSpec = {
  getAccounts(chainId: string): Promise<Account[]>
  createTx(chainId: string, from: string, callData: string): Promise<string>
  // private methods
  getSignRequests(): Promise<Record<string, SignRequest>>
  approveSignRequest(id: string): Promise<void>
  cancelSignRequest(id: string): Promise<void>
}
