const polkadotApi = require("@polkadot/api");

async function connect(customChainSpec, types) {
    const substrateConnect = await import("@substrate/connect");
    const provider = new substrateConnect.ScProvider(customChainSpec)
    const api = new polkadotApi.ApiPromise({ provider, types });
    await api.isReady;
    return api;
}

async function run(nodeName, networkInfo) {
    const {userDefinedTypes} = networkInfo.nodesByName[nodeName];
    const customChainSpec = require(networkInfo.chainSpecPath);
    console.log("bootnodes");
    customChainSpec.bootNodes = customChainSpec.bootNodes.map(addr => {
        return addr.replace("localhost", "127.0.0.1").replace("p2p","ws")
    });
    console.log(customChainSpec.bootNodes);
    const api = await connect(JSON.stringify(customChainSpec), userDefinedTypes);
    const validator = await api.query.session.validators();
    console.log("validators",validator);
    return validator.length;
}

module.exports = { run }