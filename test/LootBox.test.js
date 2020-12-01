const { expect } = require("chai");
const buidler = require('@nomiclabs/buidler')
const LootBox = require('../artifacts/LootBox')
const { deployContract } = require('ethereum-waffle')

const { ethers } = buidler;

describe('LootBox', () => {

  let wallet, wallet2

  let provider

  beforeEach(async () => {
    [wallet, wallet2] = await buidler.ethers.getSigners()
    provider = buidler.ethers.provider

    lootBox = await deployContract(wallet, LootBox, [])
    await lootBox.initialize()
  })

  describe('initialize()', () => {
    it('should not be called twice', async () => {
      await expect(lootBox.initialize()).to.be.revertedWith('LootBox/already-init')
    })
  })

  describe('plunder()', () => {
    it('cannot be called by anyone but the owner', async () => {
      await expect(lootBox.connect(wallet2).plunder([], [], [], ethers.constants.AddressZero)).to.be.revertedWith('LootBox/only-owner')
    })

    it('should fail if the to address is zero', async () => {
      await expect(lootBox.plunder([], [], [], ethers.constants.AddressZero)).to.be.revertedWith('LootBox/non-zero-to')
    })
  })

})
