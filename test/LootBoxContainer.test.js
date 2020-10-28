const { expect } = require("chai");
const buidler = require('@nomiclabs/buidler')
const IERC721 = require('../artifacts/IERC721')
const LootBoxContainer = require('../artifacts/LootBoxContainer')
const { deployContract, deployMockContract } = require('ethereum-waffle')

const { deployments, ethers } = buidler;

const toWei = ethers.utils.parseEther

const debug = require('debug')('loot-box:LootBoxContainer.test')

describe('LootBox', () => {

  let wallet, wallet2

  let provider

  let container, box

  beforeEach(async () => {
    [wallet, wallet2] = await buidler.ethers.getSigners()
    provider = buidler.ethers.provider

    box = await deployMockContract(wallet, IERC721.abi)
    container = await deployContract(wallet, LootBoxContainer, [])
    await container.initialize(box.address)
    await box.mock.ownerOf.withArgs(container.address).returns(wallet._address)
  })

  describe('initialize()', async () => {
    it('should set the erc721', async () => {
      expect(await container.erc721()).to.equal(box.address)
    })

    it('should not be called twice', async () => {
      await expect(container.initialize(box.address)).to.be.revertedWith('LootBoxContainer/already-initialized')
    })
  })

  describe('transferEther()', async () => {
    it('should allow the owner to withdraw ether', async () => {
      debug('sending eth...')

      await expect(wallet.sendTransaction({ to: container.address, value: 100 }))
        .to.emit(container, 'ReceivedEther')
        .withArgs(wallet._address, 100)

      let w = ethers.Wallet.createRandom()
      debug({ w })
      let walletX = new ethers.Wallet(w.privateKey, provider)

      debug('transferring...')

      await expect(container.transferEther(walletX.address, 10))
        .to.emit(container, 'TransferredEther')
        .withArgs(walletX.address, 10)

      expect(await provider.getBalance(container.address)).to.equal('90')
      expect(await provider.getBalance(walletX.address)).to.equal('10')
    })

    it('should not be called by anyone else', async () => {
      await expect(container.connect(wallet2).transferEther(wallet._address, 10)).to.be.revertedWith("LootBoxContainer/not-owner")
    })
  })

  describe('executeCalls()', async () => {
    it('should allow the lootbox to execute any calls', async () => {
      await box.mock.balanceOf.withArgs(wallet._address).returns('0')
      const data = (await box.populateTransaction.balanceOf(wallet._address)).data
      const calls = [{ to: box.address, data, value: 0 }]
      expect(await container.callStatic.executeCalls(calls)).to.deep.equal(['0x0000000000000000000000000000000000000000000000000000000000000000'])
      await container.executeCalls(calls)
    })

    it('should not allow anyone else to execute', async () => {
      await box.mock.balanceOf.withArgs(wallet._address).returns('0')
      const data = (await box.populateTransaction.balanceOf(wallet._address)).data
      const calls = [{ to: box.address, data, value: 0 }]
      expect(await container.callStatic.executeCalls(calls)).to.deep.equal(['0x0000000000000000000000000000000000000000000000000000000000000000'])
      await expect(container.connect(wallet2).executeCalls(calls)).to.be.revertedWith('LootBoxContainer/not-owner')
    })
  })

})
