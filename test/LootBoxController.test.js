const { expect } = require("chai");
const buidler = require('@nomiclabs/buidler')
const ERC20Mintable = require('../artifacts/ERC20Mintable')
const ERC721Mintable = require('../artifacts/ERC721Mintable')
const ERC777Mintable = require('../artifacts/ERC777Mintable')
const ERC1155Mintable = require('../artifacts/ERC1155Mintable')
const LootBox = require('../artifacts/LootBox')
const { deployContract } = require('ethereum-waffle')
const { deploy1820 } = require('deploy-eip-1820')

const { ethers, deployments } = buidler;

const toWei = ethers.utils.parseEther

const debug = require('debug')('loot-box:LootBoxController.test')

const parseLogs = (contract, logs) => logs.reduce((events, log) => {
  try {
    events.push(contract.interface.parseLog(log))
  } catch (e) {}
  return events
}, [])

const parseTx = async (contract, tx) => {
  let receipt = await contract.provider.getTransactionReceipt((await tx).hash)
  return parseLogs(contract, receipt.logs)
}

describe('LootBoxController', () => {

  let wallet, wallet2

  let provider

  let lootBoxController

  const lootBoxTokenId = 4
  const tokenId = 1
  const tokenId2 = '1234'

  beforeEach(async () => {
    [wallet, wallet2] = await buidler.ethers.getSigners()
    provider = buidler.ethers.provider

    await deployments.fixture()

    erc20MintableDeploy = await deployments.get('ERC20Mintable')
    erc20Mintable = await buidler.ethers.getContractAt('ERC20Mintable', erc20MintableDeploy.address, wallet)
    
    erc721MintableDeploy = await deployments.get('ERC721Mintable')
    erc721Mintable = await buidler.ethers.getContractAt('ERC721Mintable', erc721MintableDeploy.address, wallet)

    erc777MintableDeploy = await deployments.get('ERC777Mintable')
    erc777Mintable = await buidler.ethers.getContractAt('ERC777Mintable', erc777MintableDeploy.address, wallet)
  
    erc1155MintableDeploy = await deployments.get('ERC1155Mintable')
    erc1155Mintable = await buidler.ethers.getContractAt('ERC1155Mintable', erc1155MintableDeploy.address, wallet)

    lootBox = await deployContract(wallet, LootBox, []) // do we want to deploy here or in deloy.js

    // Make sure wallet controls loot box
    await erc721Mintable.mint(wallet._address, lootBoxTokenId)

    let lootBoxControllerResult = await deployments.get('LootBoxController')
    lootBoxController = await buidler.ethers.getContractAt('LootBoxController', lootBoxControllerResult.address, wallet)

    lootBoxAddress = await lootBoxController.computeAddress(erc721Mintable.address, lootBoxTokenId)
  
    await wallet.sendTransaction({ to: lootBoxAddress, value: toWei('1') })
    await erc721Mintable.mint(lootBoxAddress, tokenId)
    await erc20Mintable.mint(lootBoxAddress, toWei('42'))
    await erc1155Mintable.mint(lootBoxAddress, tokenId2, toWei('100'), [])
    await erc777Mintable.mint(lootBoxAddress, toWei('1234'), [], [])
  })

  describe('executeCalls()', async () => {
    it('should allow the erc721 owner to execute any calls', async () => {
      const data = (await erc721Mintable.populateTransaction.transferFrom(lootBoxAddress, wallet._address, tokenId)).data
      const calls = [{ to: erc721Mintable.address, data, value: 0 }]
      const tx = await lootBoxController.executeCalls(erc721Mintable.address, lootBoxTokenId, calls)
      const receipt = await provider.getTransactionReceipt(tx.hash)
      debug({ gasUsed: receipt.gasUsed.toString() })
      expect(await erc721Mintable.ownerOf(tokenId)).to.equal(wallet._address)
    })

    it('should revert on failure', async () => {
      await erc721Mintable.mint(wallet2._address, '5')
      const data = (await erc721Mintable.populateTransaction.transferFrom(wallet2._address, wallet._address, '5')).data
      const calls = [{ to: erc721Mintable.address, data, value: 0 }]
      await expect(lootBoxController.executeCalls(erc721Mintable.address, lootBoxTokenId, calls))
        .to.be.revertedWith('ERC721: transfer caller is not owner nor approved')
    })

    it('should not allow anyone but the owner to call', async () => {
      const data = (await erc721Mintable.populateTransaction.ownerOf(tokenId)).data
      const calls = [{ to: erc721Mintable.address, data, value: 0 }]
      await expect(lootBoxController.connect(wallet2).executeCalls(erc721Mintable.address, lootBoxTokenId, calls))
        .to.be.revertedWith('LootBoxController/only-owner')
    })
  })

  describe('plunder()', async () => {
    it('should allow a user to withdraw ERC20 tokens', async () => {
      let tx = lootBoxController.plunder(
        erc721Mintable.address,
        lootBoxTokenId,
        [erc20Mintable.address],
        [],
        []
      )

      let lootBoxEvents = await parseTx(lootBox, tx)

      debug({ lootBoxEvents })

      expect(
        lootBoxEvents.find(
          event => event.name == 'WithdrewERC20' &&
          event.args.token == erc20Mintable.address &&
          event.args.amount == toWei('42')
        )
      ).to.be

      expect(await erc20Mintable.balanceOf(wallet._address)).to.equal(toWei('42'))
    })

    it('should allow a user to withdraw ERC777 tokens', async () => {
      let tx = lootBoxController.plunder(
        erc721Mintable.address,
        lootBoxTokenId,
        [erc777Mintable.address],
        [],
        []
      )

      let lootBoxEvents = await parseTx(lootBox, tx)

      debug({ lootBoxEvents })

      expect(
        lootBoxEvents.find(
          event => event.name == 'WithdrewERC20' &&
          event.args.token == erc777Mintable.address &&
          event.args.amount == toWei('1234')
        )
      ).to.be

      expect(await erc777Mintable.balanceOf(wallet._address)).to.equal(toWei('1234'))
    })

    it('should allow a user to take ERC721 tokens', async () => {
      let tx = lootBoxController.plunder(
        erc721Mintable.address,
        lootBoxTokenId,
        [],
        [{ token: erc721Mintable.address, tokenIds: [tokenId] }],
        []
      )

      let lootBoxEvents = await parseTx(lootBox, tx)

      debug({ lootBoxEvents })

      expect(
        lootBoxEvents.find(
          event => event.name == 'WithdrewERC721' &&
          event.args.token == erc721Mintable.address &&
          event.args.tokenIds.indexOf(tokenId) != -1
        )
      ).to.be

      expect(await erc721Mintable.ownerOf(tokenId)).to.equal(wallet._address)
    })

    it("should allow a user to take ERC1155 tokens", async () => {
      let tx = lootBoxController.plunder(
        erc721Mintable.address,
        lootBoxTokenId,
        [],
        [],
        [{ token: erc1155Mintable.address, ids: [tokenId2], amounts: [toWei('100')], data: [] }]
      )

      let lootBoxEvents = await parseTx(lootBox, tx)

      debug({ lootBoxEvents })

      expect(
        lootBoxEvents.find(
          event => event.name == 'WithdrewERC1155' &&
          event.args.token == erc1155Mintable.address &&
          event.args.ids.indexOf(tokenId2) != -1
        )
      ).to.be

      expect(await erc1155Mintable.balanceOf(wallet._address, tokenId2)).to.equal(toWei('100'))
    })

    it('should allow a user to take all tokens from the contract', async () => {
      let tx = lootBoxController.plunder(
        erc721Mintable.address,
        lootBoxTokenId,
        [erc20Mintable.address, erc777Mintable.address],
        [{ token: erc721Mintable.address, tokenIds: [tokenId] }],
        [{ token: erc1155Mintable.address, ids: [tokenId2], amounts: [toWei('100')], data: [] }]
      )

      let lootBoxEvents = await parseTx(lootBox, tx)

      debug({ lootBoxEvents })

      expect(
        lootBoxEvents.find(
          event => event.name == 'WithdrewERC20' &&
          event.args.token == erc20Mintable.address &&
          event.args.amount == toWei('42')
        )
      ).to.be

      expect(
        lootBoxEvents.find(
          event => event.name == 'WithdrewERC20' &&
          event.args.token == erc777Mintable.address &&
          event.args.amount == toWei('1234')
        )
      ).to.be

      expect(
        lootBoxEvents.find(
          event => event.name == 'WithdrewERC721' &&
          event.args.token == erc721Mintable.address &&
          event.args.tokenIds.indexOf(tokenId) != -1
        )
      ).to.be

      expect(
        lootBoxEvents.find(
          event => event.name == 'WithdrewERC1155' &&
          event.args.token == erc1155Mintable.address &&
          event.args.ids.indexOf(tokenId2) != -1
        )
      ).to.be

      expect(await erc20Mintable.balanceOf(wallet._address)).to.equal(toWei('42'))
      expect(await erc777Mintable.balanceOf(wallet._address)).to.equal(toWei('1234'))
      expect(await erc721Mintable.ownerOf(tokenId)).to.equal(wallet._address)
      expect(await erc1155Mintable.balanceOf(wallet._address, tokenId2)).to.equal(toWei('100'))
    })
  })

})
