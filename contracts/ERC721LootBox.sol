pragma solidity ^0.6.12;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC721/IERC721.sol";

import "./LootBox.sol";

contract ERC721LootBox is LootBox {

  IERC721 public erc721;
  uint256 public tokenId;

  event ERC721LootBoxInitialized(address indexed erc721, uint256 indexed tokenId);

  function initialize(IERC721 _erc721, uint256 _tokenId) external {
    require(address(erc721) == address(0), "LootBoxContainer/already-initialized");
    erc721 = _erc721;
    tokenId = _tokenId;

    emit ERC721LootBoxInitialized(address(erc721), tokenId);
  }

  function owner() public override view returns (address) {
    return erc721.ownerOf(tokenId);
  }

}
