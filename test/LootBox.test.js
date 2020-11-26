const { expect } = require("chai");
const buidler = require('@nomiclabs/buidler')
const LootBox = require('../artifacts/LootBox')
const { deployContract } = require('ethereum-waffle')

const { ethers } = buidler;

describe('LootBoxController', () => {

  let wallet, wallet2

  let provider

  beforeEach(async () => {
    [wallet, wallet2] = await buidler.ethers.getSigners()
    provider = buidler.ethers.provider

    lootBox = await deployContract(wallet, LootBox, [false])
  })

  describe('plunder()', () => {
    it('should fail if the to address is zero', async () => {
      await expect(lootBox.plunder([], [], [], ethers.constants.AddressZero)).to.be.revertedWith('LootBox/non-zero-to')
    })
  })

})
