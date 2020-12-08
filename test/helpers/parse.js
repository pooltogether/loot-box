const parseLogs = (contract, logs) => logs.reduce((events, log) => {
  try {
    events.push(contract.interface.parseLog(log))
  } catch (e) {}
  return events
}, [])

const parseTx = async (contract, tx) => {
  let receipt = await contract.provider.getTransactionReceipt((await tx).hash)
  return parseLogs(contract, receipt.logs)
}

module.exports = {
  parseLogs,
  parseTx
}