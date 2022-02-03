const { connect } = require("./utils")

async function run(nodeName, networkInfo) {
  const api = await connect(nodeName, networkInfo)
  const decimals = api?.registry?.chainDecimals

  return decimals[0]
}

module.exports = { run }
