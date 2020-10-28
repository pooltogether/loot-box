const debug = require('debug')('loot-box:deploy.js')

module.exports = async (buidler) => {
  const { getNamedAccounts, deployments } = buidler
  const { deploy } = deployments  
  const { deployer } = await getNamedAccounts()

  debug({ deployer })
  
  let lootBoxContainerFactory = await deploy('LootBoxContainerFactory', {
    from: deployer,
    skipIfAlreadyDeployed: true
  })

  await deploy('LootBoxFactory', {
    args: [
      lootBoxContainerFactory.address
    ],
    from: deployer,
    skipIfAlreadyDeployed: true
  })

};
