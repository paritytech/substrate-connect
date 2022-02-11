import checkMessage from "./checkMessage"

describe("checkMessage works", () => {
  test("checkMessage properly works", () => {
    expect(checkMessage({})).toBe(false)

    expect(
      checkMessage({
        origin: "substrate-connect-client",
        type: "rpc",
        chainId: "hello",
        jsonRpcMessage: "hi",
      }),
    ).toBe(true)

    expect(
      checkMessage({
        origin: "substrate-connect-client",
        type: "unknown-msg-type",
      }),
    ).toBe(false)

    // extra fields aren't a problem
    expect(
      checkMessage({
        origin: "substrate-connect-client",
        type: "rpc",
        chainId: "hello",
        jsonRpcMessage: "hi",
        hiddenField: true,
      }),
    ).toBe(true)

    expect(
      checkMessage({
        type: "rpc",
        chainId: "hello",
        jsonRpcMessage: "hi",
      }),
    ).toBe(false)

    expect(
      checkMessage({
        origin: "substrate-connect-client",
        type: "add-chain",
        chainId: "hello",
        chainSpec: "foo",
        potentialRelayChainIds: ["bar"],
      }),
    ).toBe(true)

    expect(
      checkMessage({
        origin: "substrate-connect-client",
        type: "add-chain",
        chainId: "hello",
        chainSpec: "foo",
        potentialRelayChainIds: [58],
      }),
    ).toBe(false)

    expect(
      checkMessage({
        origin: "substrate-connect-client",
        type: "add-chain",
        chainId: "hello",
        chainSpec: "foo",
        potentialRelayChainIds: ["bar", 58],
      }),
    ).toBe(false)

    expect(
      checkMessage({
        origin: "substrate-connect-client",
        type: "add-chain",
        chainId: "hello",
        chainSpec: "foo",
        potentialRelayChainIds: 5,
      }),
    ).toBe(false)

    expect(
      checkMessage({
        origin: "substrate-connect-client",
        type: "add-chain",
        chainId: "hello",
        chainSpec: "foo",
      }),
    ).toBe(false)
  })
})
