const { expect } = require("chai");
const buidler = require('@nomiclabs/buidler')

const { ethers, deployments } = buidler;

const debug = require('debug')('loot-box:ERC721Ownable.test')

describe('ERC721Ownable', () => {

  let wallet, wallet2

  let provider

  let erc721Ownable

  beforeEach(async () => {
    [wallet, wallet2] = await buidler.ethers.getSigners()
    provider = buidler.ethers.provider

    process.env.ERC721_NAME = 'NAME'
    process.env.ERC721_SYMBOL = 'SYMBOL'
    process.env.ERC721_BASE_URI = 'BASE_URI'

    await deployments.fixture()

    let erc721OwnableResult = await deployments.get('ERC721Ownable')
    erc721Ownable = await buidler.ethers.getContractAt('ERC721Ownable', erc721OwnableResult.address, wallet)
  })

  describe('deployer', () => {
    it('should setup the right vars', async () => {
      expect(await erc721Ownable.name()).to.equal('NAME')
      expect(await erc721Ownable.symbol()).to.equal('SYMBOL')
      expect(await erc721Ownable.baseURI()).to.equal('BASE_URI')
      expect(await erc721Ownable.owner()).to.equal(wallet._address)
    })
  })

  describe('setBaseURI()', () => {
    it('should allow the owner to change base URI', async () => {
      await expect(erc721Ownable.setBaseURI('foo/'))
        .to.emit(erc721Ownable, 'ERC721OwnableBaseURISet')
        .withArgs('foo/')
      
      expect(await erc721Ownable.baseURI()).to.equal('foo/')
    })

    it('should not allow anyone else to change', async () => {
      await expect(erc721Ownable.connect(wallet2).setBaseURI('foo/')).to.be.revertedWith('Ownable: caller is not the owner')
    })
  })

  describe('mint()', () => {
    it('should create a new nft', async () => {
      await expect(erc721Ownable.mint(wallet._address))
        .to.emit(erc721Ownable, 'Transfer')
        .withArgs(ethers.constants.AddressZero, wallet._address, 1)

      await expect(erc721Ownable.mint(wallet._address))
        .to.emit(erc721Ownable, 'Transfer')
        .withArgs(ethers.constants.AddressZero, wallet._address, 2)

      await expect(erc721Ownable.mint(wallet._address))
        .to.emit(erc721Ownable, 'Transfer')
        .withArgs(ethers.constants.AddressZero, wallet._address, 3)
    })
  })

})
