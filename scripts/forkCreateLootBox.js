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
  const gnosisSafe = await ethers.provider.getUncheckedSigner('0x029Aa20Dcc15c022b1b61D420aaCf7f179A9C73f')
  const binance = await ethers.provider.getUncheckedSigner('0x564286362092D8e7936f0549571a803B203aAceD')

  const comp = await ethers.getContractAt('ERC20Upgradeable', '0xc00e94cb662c3520282e6f5717214004a7f26888', binance)

  const d = await deployments.all()

  const lootBoxController = await ethers.getContractAt('LootBoxController', d.LootBoxController.address, gnosisSafe)
  dim(`Found controller at ${lootBoxController.address}`)

  dim(`Creating listener...`)
  const listenerFactory = await ethers.getContractAt('LootBoxPrizeStrategyListenerFactory', d.LootBoxPrizeStrategyListenerFactory.address, signers[0])
  const listenerCreateTx = await listenerFactory.create(gnosisSafe._address)
  const listenerCreateReceipt = await provider.getTransactionReceipt(listenerCreateTx.hash)
  const listenerCreateEvents = listenerCreateReceipt.logs.reduce((array, log) => { try { array.push(listenerFactory.interface.parseLog(log)) } catch (e) {} return array }, [])
  const listenerAddress = listenerCreateEvents[0].args.listener
  green(`Created listener at ${listenerAddress}`)

  dim(`Creating ERC721Controlled...`)
  const erc721ControlledFactory = await ethers.getContractAt('ERC721ControlledFactory', d.ERC721ControlledFactory.address, gnosisSafe)
  const erc721ControlledCreateTx = await erc721ControlledFactory.createERC721Controlled("PoolTogether LootBox", "PTLOOT", "https://nfts.pooltogether.com/ptloot/")
  const erc721ControlledCreateReceipt = await provider.getTransactionReceipt(erc721ControlledCreateTx.hash)
  const erc721ControlledCreateEvents = erc721ControlledCreateReceipt.logs.reduce((array, log) => { try { array.push(erc721ControlledFactory.interface.parseLog(log)) } catch (e) {} return array }, [])
  const erc721ControlledAddress = erc721ControlledCreateEvents[0].args.token
  green(`Created ERC721Controlled at ${erc721ControlledAddress}`)
  
  const listener = await ethers.getContractAt('LootBoxPrizeStrategyListener', listenerAddress, gnosisSafe)
  const token = await ethers.getContractAt('ERC721Controlled', erc721ControlledAddress, gnosisSafe)

  dim(`Adding listener as admin to token`)
  await token.grantRole(ethers.constants.HashZero, listener.address)

  const prizePool = await ethers.getContractAt('PrizePool', '0xEBfb47A7ad0FD6e57323C8A42B2E5A6a4F68fc1a', gnosisSafe)  
  const prizeStrategy = await ethers.getContractAt('PeriodicPrizeStrategy', await prizePool.prizeStrategy(), gnosisSafe)

  dim(`Setting periodic prize strategy listener on strategy ${prizeStrategy.address}...`)
  await prizeStrategy.setPeriodicPrizeStrategyListener(listener.address)

  dim(`Configuring the token to use for the strategy...`)
  await listener.setERC721Controlled(prizeStrategy.address, token.address)

  dim(`Minting first loot box to prize pool...`)
  let mintTx = await token.mint(prizePool.address)
  let mintReceipt = await provider.getTransactionReceipt(mintTx.hash)
  let mintEvents = mintReceipt.logs.reduce((array, log) => { try { array.push(token.interface.parseLog(log)) } catch (e) {} return array }, [])
  let tokenId = mintEvents[0].args.tokenId
  green(`Loot Box with tokenId ${tokenId.toString()} minted to prize pool`)

  dim(`Adding loot box to external awards...`)
  await prizeStrategy.addExternalErc721Award(token.address, [tokenId])

  dim(`Minting another loot box to gnosis safe...`)
  mintTx = await token.mint(gnosisSafe._address)
  mintReceipt = await provider.getTransactionReceipt(mintTx.hash)
  mintEvents = mintReceipt.logs.reduce((array, log) => { try { array.push(token.interface.parseLog(log)) } catch (e) {} return array }, [])
  tokenId = mintEvents[0].args.tokenId
  const lootBoxAddress = await lootBoxController.computeAddress(token.address, tokenId)
  green(`Loot Box with tokenId ${tokenId.toString()} and address ${lootBoxAddress} minted to gnosis safe`)

  dim(`Minting another loot box to the gnosis safe loot box...`)
  mintTx = await token.mint(lootBoxAddress)
  mintReceipt = await provider.getTransactionReceipt(mintTx.hash)
  mintEvents = mintReceipt.logs.reduce((array, log) => { try { array.push(token.interface.parseLog(log)) } catch (e) {} return array }, [])
  tokenId = mintEvents[0].args.tokenId
  green(`Loot Box with tokenId ${tokenId.toString()} minted to gnosis safe`)

  dim(`Transferring 100 comp to loot box...`)
  await comp.transfer(lootBoxAddress, ethers.utils.parseEther('100'))
}

run()
