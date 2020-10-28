const networks = require('./buidler.networks')

usePlugin("@nomiclabs/buidler-ethers");
usePlugin("@nomiclabs/buidler-waffle");
usePlugin("buidler-deploy");
usePlugin("solidity-coverage");
usePlugin("@nomiclabs/buidler-etherscan");

module.exports = {
  solc: {
    version: "0.6.12",
    optimizer: {
      enabled: true,
      runs: 200
    },
    evmVersion: "istanbul"
  },
  networks,
  namedAccounts: {
    deployer: {
      default: 0
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  }
};
