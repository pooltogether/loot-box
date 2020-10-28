const { expect } = require("chai");
const buidler = require('@nomiclabs/buidler')
const { deployments, ethers } = buidler;

const debug = require('debug')('loot-box:LootBoxFactory.test')

describe('LootBoxFactory', () => {

  let wallet, wallet2

  let provider

  beforeEach(async () => {
    [wallet, wallet2] = await buidler.ethers.getSigners()
    provider = buidler.ethers.provider

    await deployments.fixture()

    lootBoxFactory = await ethers.getContractAt(
      "LootBoxFactory",
      (await deployments.get("LootBoxFactory")).address,
      wallet
    )
  })

  describe('create()', () => {
    it('should allow a user to create a new type of LootBox', async () => {

      const name = 'PoolTogether LootBox'
      const symbol = 'PTBOX'
      const baseUri = 'https://test'

      let tx = await lootBoxFactory.create(
        name,
        symbol,
        baseUri
      )
      let receipt = await provider.getTransactionReceipt(tx.hash)
      let data = receipt.logs[0].data
      let address = ethers.utils.defaultAbiCoder.decode(['address'], data)[0]
      let contract = await ethers.getContractAt('LootBox', address, wallet)

      expect(await contract.name()).to.equal(name)
      expect(await contract.symbol()).to.equal(symbol)
      expect(await contract.baseURI()).to.equal(baseUri)
    })
  })
})
