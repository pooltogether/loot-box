// SPDX-License-Identifier: MIT

pragma solidity >=0.6.0 <0.7.0;

import "@openzeppelin/contracts/access/AccessControl.sol";

import "./ERC721Controlled.sol";
import "./external/pooltogether/PeriodicPrizeStrategyListenerInterface.sol";
import "./external/pooltogether/PeriodicPrizeStrategyInterface.sol";

/// @title Allows a PrizeStrategy to automatically create a new ERC721 after the award
contract LootBoxPrizeStrategyListener is AccessControl, PeriodicPrizeStrategyListenerInterface {

  bytes4 private constant ERC165_INTERFACE_ID_PERIODIC_PRIZE_STRATEGY_LISTENER = 0x575072c6;
  bytes4 private constant ERC165_INTERFACE_ID_ERC165 = 0x01ffc9a7;

  event ERC721ControlledSet(address prizeStrategy, address erc721Controlled);

  mapping(address => ERC721Controlled) public erc721ControlledTokens;

  constructor () public {
    _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
  }

  function afterPrizePoolAwarded(uint256, uint256) external override {
    ERC721Controlled erc721Controlled = erc721ControlledTokens[msg.sender];
    if (address(erc721Controlled) == address(0)) {
      return;
    }
    PeriodicPrizeStrategyInterface prizeStrategy = PeriodicPrizeStrategyInterface(msg.sender);
    uint256[] memory tokenIds = new uint256[](1);
    tokenIds[0] = erc721Controlled.mint(prizeStrategy.prizePool());
    prizeStrategy.addExternalErc721Award(address(erc721Controlled), tokenIds);
  }

  function setERC721Controlled(address prizeStrategy, ERC721Controlled _erc721Controlled) external onlyAdmin {
    require(_erc721Controlled.hasRole(DEFAULT_ADMIN_ROLE, address(this)), "LootBoxPrizeStrategyListener/missing-admin-role");
    erc721ControlledTokens[prizeStrategy] = _erc721Controlled;

    emit ERC721ControlledSet(prizeStrategy, address(_erc721Controlled));
  }

  function supportsInterface(bytes4 interfaceId) external override view returns (bool) {
    return (
      interfaceId == ERC165_INTERFACE_ID_ERC165 ||
      interfaceId == ERC165_INTERFACE_ID_PERIODIC_PRIZE_STRATEGY_LISTENER
    );
  }

  modifier onlyAdmin() {
    require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "LootBoxPrizeStrategyListener/only-admin");
    _;
  }

}
