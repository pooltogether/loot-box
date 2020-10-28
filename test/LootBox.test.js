const { expect } = require("chai");
const buidler = require('@nomiclabs/buidler')
const LootBox = require('../artifacts/LootBox.json')
const LootBoxContainerFactory = require('../artifacts/LootBoxContainerFactory.json')
const { deployContract, deployMockContract } = require('ethereum-waffle')
const { deployments, ethers } = buidler;

const debug = require('debug')('loot-box:LootBox.test')

describe('LootBox', () => {

  const name = 'PoolTogether LootBox'
  const symbol = 'PTBOX'
  const baseUri = 'https://test'

  let wallet, wallet2

  let provider

  beforeEach(async () => {
    [wallet, wallet2] = await buidler.ethers.getSigners()
    provider = buidler.ethers.provider

    lootBoxContainerFactory = await deployMockContract(wallet, LootBoxContainerFactory.abi)

    lootBox = await deployContract(wallet, LootBox, [])
    await lootBox.initialize(
      name,
      symbol,
      baseUri,
      lootBoxContainerFactory.address
    )
  })

  describe('initialize()', () => {
    it('should work', async () => {
      expect(await lootBox.name()).to.equal(name)
      expect(await lootBox.symbol()).to.equal(symbol)
      expect(await lootBox.baseURI()).to.equal(baseUri)
    })
  })

  describe('mint()', () => {
    it('should allow a user to create a box', async () => {
      let address = '0xE19fe7A9aA49585510041ECDe274F6926c212C43'
      await lootBoxContainerFactory.mock.create.withArgs(lootBox.address).returns(address)

      let tx = await lootBox.mint()
      let receipt = await provider.getTransactionReceipt(tx.hash)
      debug({ gasUsed: receipt.gasUsed.toString() })
      
      expect(await lootBox.ownerOf(address)).to.equal(wallet._address)
    })
  })
})
