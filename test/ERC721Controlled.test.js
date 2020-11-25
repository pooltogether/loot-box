const { expect } = require("chai");
const buidler = require('@nomiclabs/buidler')

const { ethers, deployments } = buidler;

const debug = require('debug')('loot-box:ERC721Controlled.test')

describe('ERC721Controlled', () => {

  let wallet, wallet2

  let provider

  let token

  beforeEach(async () => {
    [wallet, wallet2] = await buidler.ethers.getSigners()
    provider = buidler.ethers.provider

    process.env.ERC721_NAME = 'NAME'
    process.env.ERC721_SYMBOL = 'SYMBOL'
    process.env.ERC721_BASE_URI = 'BASE_URI'

    await deployments.fixture()

    let factoryResult = await deployments.get('ERC721ControlledFactory')
    factory = await buidler.ethers.getContractAt('ERC721ControlledFactory', factoryResult.address, wallet)

    let createdERC721Tx = await factory.createERC721Controlled(
      'NAME',
      'SYMBOL',
      'BASE_URI'
    )
    let receipt = await provider.getTransactionReceipt(createdERC721Tx.hash)
    let log = receipt.logs[receipt.logs.length - 1]
    let event = factory.interface.parseLog(log)
    token = await buidler.ethers.getContractAt('ERC721Controlled', event.args.token, wallet)
  })

  describe('factory', ()=>{
    it('emits an ERC721ControlledCreated event', async () => {
      await expect(factory.createERC721Controlled("test","test", "test")).to.emit(factory, 'ERC721ControlledCreated')
    })
  })

  describe('deployer', () => {
    it('should setup the right vars', async () => {
      expect(await token.name()).to.equal('NAME')
      expect(await token.symbol()).to.equal('SYMBOL')
      expect(await token.baseURI()).to.equal('BASE_URI')
    })
  })

  describe('setBaseURI()', () => {
    it('should allow the admin to change base URI', async () => {
      await expect(token.setBaseURI('foo/'))
        .to.emit(token, 'ERC721ControlledBaseURISet')
        .withArgs('foo/')
      
      expect(await token.baseURI()).to.equal('foo/')
    })

    it('should not allow anyone else to change', async () => {
      await expect(token.connect(wallet2).setBaseURI('foo/')).to.be.revertedWith('ERC721Controlled/only-admin')
    })
  })

  describe('mint()', () => {
    it('should create a new nft', async () => {
      await expect(token.mint(wallet._address))
        .to.emit(token, 'Transfer')
        .withArgs(ethers.constants.AddressZero, wallet._address, 1)

      await expect(token.mint(wallet._address))
        .to.emit(token, 'Transfer')
        .withArgs(ethers.constants.AddressZero, wallet._address, 2)

      await expect(token.mint(wallet._address))
        .to.emit(token, 'Transfer')
        .withArgs(ethers.constants.AddressZero, wallet._address, 3)

      expect(await token.totalSupply()).to.equal(3)
    })

    it('should not allow anyone else to mint', async () => {
      await expect(token.connect(wallet2).mint(wallet2._address)).to.be.revertedWith('ERC721Controlled/only-admin')
    })
  })

})
