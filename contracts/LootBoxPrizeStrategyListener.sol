// SPDX-License-Identifier: MIT

pragma solidity >=0.6.0 <0.7.0;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/Initializable.sol";
import "@pooltogether/pooltogether-contracts/contracts/prize-strategy/PeriodicPrizeStrategy.sol";
import "@pooltogether/pooltogether-contracts/contracts/prize-strategy/PeriodicPrizeStrategyListener.sol";

import "./ERC721Controlled.sol";

/// @title Allows a PrizeStrategy to automatically create a new ERC721 after the award
contract LootBoxPrizeStrategyListener is Initializable, AccessControlUpgradeable, PeriodicPrizeStrategyListener {

  event ERC721ControlledSet(address prizeStrategy, address erc721Controlled);

  mapping(address => ERC721Controlled) public erc721ControlledTokens;

  function initialize (address admin) public initializer {
    _setupRole(DEFAULT_ADMIN_ROLE, admin);
  }

  function afterPrizePoolAwarded(uint256, uint256) external override {
    ERC721Controlled erc721Controlled = erc721ControlledTokens[msg.sender];
    if (address(erc721Controlled) == address(0)) {
      return;
    }
    PeriodicPrizeStrategy prizeStrategy = PeriodicPrizeStrategy(msg.sender);
    uint256[] memory tokenIds = new uint256[](1);
    tokenIds[0] = erc721Controlled.mint(address(prizeStrategy.prizePool()));
    prizeStrategy.addExternalErc721Award(erc721Controlled, tokenIds);
  }

  function setERC721Controlled(address prizeStrategy, ERC721Controlled _erc721Controlled) external onlyAdmin {
    require(
      address(_erc721Controlled) == address(0) || _erc721Controlled.hasRole(DEFAULT_ADMIN_ROLE, address(this)),
      "LootBoxPrizeStrategyListener/missing-admin-role"
    );
    erc721ControlledTokens[prizeStrategy] = _erc721Controlled;

    emit ERC721ControlledSet(prizeStrategy, address(_erc721Controlled));
  }

  modifier onlyAdmin() {
    require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "LootBoxPrizeStrategyListener/only-admin");
    _;
  }

}
