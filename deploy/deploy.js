const debug = require('debug')('loot-box:deploy.js')

module.exports = async (buidler) => {
  const { getNamedAccounts, deployments } = buidler
  const { deploy } = deployments  
  const { deployer } = await getNamedAccounts()

  debug({ deployer })

  await deploy('ERC721LootBoxFactory', {
    from: deployer,
    skipIfAlreadyDeployed: true
  })

};
