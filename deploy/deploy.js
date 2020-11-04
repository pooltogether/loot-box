const debug = require('debug')('loot-box:deploy.js')
const { deploy1820 } = require('deploy-eip-1820')

module.exports = async (buidler) => {
  const { getNamedAccounts, deployments } = buidler
  const { deploy } = deployments  
  const { deployer } = await getNamedAccounts()
  const signer = await ethers.provider.getSigner(deployer)

  await deploy1820(signer)

  debug({ deployer })

  await deploy('LootBoxController', {
    from: deployer,
    skipIfAlreadyDeployed: true
  })

  if (
    process.env.ERC721_NAME &&
    process.env.ERC721_SYMBOL &&
    process.env.ERC721_BASE_URI
  ) {
    await deploy('ERC721Ownable', {
      args: [
        process.env.ERC721_NAME,
        process.env.ERC721_SYMBOL,
        process.env.ERC721_BASE_URI
      ],
      from: deployer,
      skipIfAlreadyDeployed: true
    })
  } else {
    console.warn('No ERC721 env vars declared, skipping ERC721 deployment.')
  }

};
