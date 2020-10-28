pragma solidity ^0.6.12;

import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC721/ERC721.sol";
import "./external/openzeppelin/ProxyFactory.sol";
import "./LootBoxContainerFactory.sol";

contract LootBox is ERC721UpgradeSafe, ProxyFactory {

  event LootBoxInitialized(
    string name,
    string symbol,
    string baseURI
  );

  event TokenURISet(uint256 indexed tokenId, string tokenUri);

  LootBoxContainerFactory public lootBoxContainerFactory;

  function initialize (
    string calldata name,
    string calldata symbol,
    string calldata baseURI_,
    LootBoxContainerFactory _factory
  ) external initializer {
    __ERC721_init(name, symbol);
    _setBaseURI(baseURI_);
    lootBoxContainerFactory = _factory;

    emit LootBoxInitialized(name, symbol, baseURI_);
  }

  function mint() external returns (address) {
    LootBoxContainer container = lootBoxContainerFactory.create(this);
    uint256 id = uint256(address(container));
    _mint(_msgSender(), id);
  }

}
