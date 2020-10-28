const { expect } = require("chai");
const buidler = require('@nomiclabs/buidler')
const IERC721 = require('../artifacts/IERC721.json')
const { deployMockContract } = require('ethereum-waffle')
const { deployments, ethers } = buidler;

const debug = require('debug')('loot-box:LootBoxContainerFactory.test')

describe('LootBoxContainerFactory', () => {

  let wallet, wallet2

  let provider

  beforeEach(async () => {
    [wallet, wallet2] = await buidler.ethers.getSigners()
    provider = buidler.ethers.provider

    erc721 = await deployMockContract(wallet, IERC721.abi)

    await deployments.fixture()

    lootBoxContainerFactory = await ethers.getContractAt(
      "LootBoxContainerFactory",
      (await deployments.get("LootBoxContainerFactory")).address,
      wallet
    )
  })

  describe('create()', () => {
    it('should allow a user to create a new type of LootBox', async () => {
      let tx = await lootBoxContainerFactory.create(erc721.address)
      let receipt = await provider.getTransactionReceipt(tx.hash)
      let data = receipt.logs[0].data
      let address = ethers.utils.defaultAbiCoder.decode(['address'], data)[0]

      let contract = await ethers.getContractAt('LootBoxContainer', address, wallet)

      expect(await contract.erc721()).to.equal(erc721.address)
    })
  })
})
