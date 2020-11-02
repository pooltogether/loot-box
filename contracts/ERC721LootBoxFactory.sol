pragma solidity ^0.6.12;

import "./external/openzeppelin/ProxyFactory.sol";
import "./ERC721LootBox.sol";

contract ERC721LootBoxFactory is ProxyFactory {

  ERC721LootBox public lootBoxInstance;

  event ERC721LootBoxCreated(address indexed lootBox, address indexed erc721, uint256 indexed tokenId);

  constructor () public {
    lootBoxInstance = new ERC721LootBox();
  }

  function create(IERC721 _erc721, uint256 _tokenId) external returns (ERC721LootBox) {
    ERC721LootBox lootBox = ERC721LootBox(payable(deployMinimal(address(lootBoxInstance), "")));
    lootBox.initialize(_erc721, _tokenId);

    emit ERC721LootBoxCreated(address(lootBox), address(_erc721), _tokenId);

    return lootBox;
  }

}
