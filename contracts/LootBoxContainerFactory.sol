pragma solidity ^0.6.12;

import "./external/openzeppelin/ProxyFactory.sol";
import "./LootBoxContainer.sol";
import "./LootBox.sol";

contract LootBoxContainerFactory is ProxyFactory {

  LootBoxContainer public lootBoxContainerInstance;

  constructor () public {
    lootBoxContainerInstance = new LootBoxContainer();
  }

  function create(LootBox lootBox) external returns (LootBoxContainer) {
    LootBoxContainer lootBoxContainer = LootBoxContainer(payable(deployMinimal(address(lootBoxContainerInstance), "")));
    lootBoxContainer.initialize(lootBox);
    return lootBoxContainer;
  }

}
