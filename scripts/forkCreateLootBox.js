const buidler = require('@nomiclabs/buidler')
const chalk = require("chalk")

function dim() {
  console.log(chalk.dim.call(chalk, ...arguments))
}

function yellow() {
  console.log(chalk.yellow.call(chalk, ...arguments))
}

function green() {
  console.log(chalk.green.call(chalk, ...arguments))
}

async function run() {
  const { deployments, ethers } = buidler
  const { provider } = ethers

  const signers = await ethers.getSigners()
  
  const d = await deployments.all()


  dim(`Creating listener...`)
  const listenerFactory = await ethers.getContractAt('LootBoxPrizeStrategyListenerFactory', d.LootBoxPrizeStrategyListenerFactory.address, signers[0])
  const listenerCreateTx = await listenerFactory.create(signers[0]._address)
  const listenerCreateReceipt = await provider.getTransactionReceipt(listenerCreateTx.hash)
  const listenerCreateEvents = listenerCreateReceipt.logs.reduce((array, log) => { try { array.push(listenerFactory.interface.parseLog(log)) } catch (e) {} return array }, [])
  const listenerAddress = listenerCreateEvents[0].args.listener
  green(`Created listener at ${listenerAddress}`)

  dim(`Creating ERC721Controlled...`)
  const erc721ControlledFactory = await ethers.getContractAt('ERC721ControlledFactory', d.ERC721ControlledFactory.address, signers[0])
  const erc721ControlledCreateTx = await erc721ControlledFactory.createERC721Controlled("PoolTogether LootBox", "PTLOOT", "https://nfts.pooltogether.com/ptloot/")
  const erc721ControlledCreateReceipt = await provider.getTransactionReceipt(erc721ControlledCreateTx.hash)
  const erc721ControlledCreateEvents = erc721ControlledCreateReceipt.logs.reduce((array, log) => { try { array.push(erc721ControlledFactory.interface.parseLog(log)) } catch (e) {} return array }, [])
  const erc721ControlledAddress = erc721ControlledCreateEvents[0].args.token
  green(`Created ERC721Controlled at ${erc721ControlledAddress}`)
  
  const listener = await ethers.getContractAt('LootBoxPrizeStrategyListener', listenerAddress, signers[0])
  const token = await ethers.getContractAt('ERC721Controlled', erc721ControlledAddress, signers[0])

  dim(`Adding listener as admin to token`)
  await token.grantRole(ethers.constants.HashZero, listener.address)

  const gnosisSafe = await provider.getUncheckedSigner('0x029Aa20Dcc15c022b1b61D420aaCf7f179A9C73f')
  const prizePool = await ethers.getContractAt('PrizePool', '0xEBfb47A7ad0FD6e57323C8A42B2E5A6a4F68fc1a', gnosisSafe)  
  const prizeStrategy = await ethers.getContractAt('PeriodicPrizeStrategy', await prizePool.prizeStrategy(), signers[0])

  dim(`Setting periodic prize strategy listener on strategy ${prizeStrategy.address}...`)
  await prizeStrategy.setPeriodicPrizeStrategyListener(listener.address)

  dim(`Configuring the token to use for the strategy...`)
  await listener.setERC721Controlled(prizeStrategy.address, token.address)

  dim(`Minting first loot box to prize pool...`)
  const mintTx = await token.mint(prizePool.address)
  const mintReceipt = await provider.getTransactionReceipt(mintTx.hash)
  const mintEvents = mintReceipt.logs.reduce((array, log) => { try { array.push(token.interface.parseLog(log)) } catch (e) {} return array }, [])
  const tokenId = mintEvents[0].args.tokenId
  green(`Loot Box with tokenId ${tokenId.toString()} created`)

  dim(`Adding loot box to external awards...`)
  await prizeStrategy.addExternalErc721Award(token.address, [tokenId])
}

run()
