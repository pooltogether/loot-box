const { expect } = require("chai");
const buidler = require('@nomiclabs/buidler')
const { deployMockContract } = require('ethereum-waffle')
const PeriodicPrizeStrategy = require('../artifacts/PeriodicPrizeStrategy.json')
const ERC721Controlled = require('../artifacts/ERC721Controlled.json')

const { deployments } = buidler;

const debug = require('debug')('loot-box:LootBoxPrizeStrategyListener.test')

describe('LootBoxPrizeStrategyListener', () => {

  let wallet, wallet2

  let provider

  let token, prizeStrategy

  beforeEach(async () => {
    [wallet, wallet2] = await buidler.ethers.getSigners()
    provider = buidler.ethers.provider

    await deployments.fixture()

    let listenerResult = await deployments.get('LootBoxPrizeStrategyListener')
    listener = await buidler.ethers.getContractAt('LootBoxPrizeStrategyListener', listenerResult.address, wallet)

    prizeStrategy = await deployMockContract(wallet, PeriodicPrizeStrategy.abi)
    // pretend wallet is the prize pool
    await prizeStrategy.mock.prizePool.returns(wallet._address)
    token = await deployMockContract(wallet, ERC721Controlled.abi)
  })

  describe('deployer', () => {
    it('set the wallet as the admin', async () => {
      expect(await listener.hasRole('0x0000000000000000000000000000000000000000000000000000000000000000', wallet._address)).to.equal(true)
    })
  })

  describe('afterPrizePoolAwarded()', () => {
    it('should do nothing if there is no token configured', async () => {
      await prizeStrategy.call(listener, 'afterPrizePoolAwarded', '0', '0');
    })

    it('should mint a new ERC721 if configured', async () => {
      /// setup the token
      await token.mock.hasRole.returns(true)
      await listener.setERC721Controlled(prizeStrategy.address, token.address)

      /// Ensure call succeeds
      await token.mock.mint.withArgs(wallet._address).returns(82)
      await prizeStrategy.mock.addExternalErc721Award.withArgs(token.address, [82]).returns()
      await prizeStrategy.call(listener, 'afterPrizePoolAwarded', '0', '0');
    })
  })

  describe('setERC721Controlled', () => {
    it('should fail if the user is not an admin', async () => {
      await expect(listener.connect(wallet2).setERC721Controlled(prizeStrategy.address, token.address)).to.be.revertedWith("LootBoxPrizeStrategyListener/only-admin")
    })

    it('should fail if the listener is not a token admin', async () => {
      await token.mock.hasRole.returns(false)
      await expect(listener.setERC721Controlled(prizeStrategy.address, token.address)).to.be.revertedWith("LootBoxPrizeStrategyListener/missing-admin-role")
    })

    it('should succeed', async () => {
      /// setup the token
      await token.mock.hasRole.returns(true)
      await listener.setERC721Controlled(prizeStrategy.address, token.address)

      expect(await listener.erc721ControlledTokens(prizeStrategy.address)).to.equal(token.address)
    })
  })

})
