// SPDX-License-Identifier: MIT

pragma solidity ^0.6.12;

import "./external/pooltogether/MinimalProxyLibrary.sol";
import "./LootBoxPrizeStrategyListener.sol";

/// @title Allows users to plunder an address associated with an ERC721
/// @author Brendan Asselstine
/// @notice Counterfactually instantiates a "Loot Box" at an address unique to an ERC721 token.  The address for an ERC721 token can be computed and later
/// plundered by transferring token balances to the ERC721 owner.
contract LootBoxPrizeStrategyListenerFactory {

  event CreatedListener(LootBoxPrizeStrategyListener indexed listener);

  function create(address owner) external returns (LootBoxPrizeStrategyListener) {
    LootBoxPrizeStrategyListener listener = new LootBoxPrizeStrategyListener();
    listener.initialize(owner);

    emit CreatedListener(listener);

    return listener;
  }

}
