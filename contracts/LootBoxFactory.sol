pragma solidity ^0.6.12;

import "./external/openzeppelin/ProxyFactory.sol";
import "./LootBox.sol";

contract LootBoxFactory is ProxyFactory {

  LootBox public lootBoxInstance;
  LootBoxContainerFactory public lootBoxContainerFactory;

  constructor (LootBoxContainerFactory _factory) public {
    lootBoxInstance = new LootBox();
    lootBoxContainerFactory = _factory;
  }

  function create(
    string calldata name,
    string calldata symbol,
    string calldata baseURI_
  ) external returns (LootBox) {
    LootBox lootBox = LootBox(payable(deployMinimal(address(lootBoxInstance), "")));
    lootBox.initialize(name, symbol, baseURI_, lootBoxContainerFactory);
    return lootBox;
  }

}
