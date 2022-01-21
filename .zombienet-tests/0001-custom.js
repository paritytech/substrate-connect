async function connect(customChainSpec, types) {
    const substrateConnect = await import("@substrate/connect");
    const provider = substrateConnect.ScProvider(customChainSpec)
    const api = new polkadotApi.ApiPromise({ provider, types });
    await api.isReady;
    return api;
}

async function run(nodeName, networkInfo) {
    const {userDefinedTypes} = networkInfo.nodesByName[nodeName];
    const customChainSpec = require(networkInfo.chainSpecPath);
    const api = await connect(JSON.stringify(customChainSpec), userDefinedTypes);
    const validator = await api.query.session.validators();
    return validator.length;
}

module.exports = { run }