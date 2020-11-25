// SPDX-License-Identifier: MIT

pragma solidity ^0.6.12;

import "./ERC721Controlled.sol";

/// @title Factory to create ERC721Controlled tokens
/// @author Brendan Asselstine <brendan@pooltogether.com>
/// @notice Creates new ERC721Controlled tokens using the minimal proxy pattern.
contract ERC721ControlledFactory {

  /// @notice Emitted when a ERC721Controlled is created
  event ERC721ControlledCreated(address indexed token);

  /// @notice Creates an ERC721Controlled contract
  /// @return The address of the newly created ERC721Controlled
  function createERC721Controlled(
    string memory name,
    string memory symbol,
    string memory baseURI
  ) external returns (ERC721Controlled) {
    ERC721Controlled result = new ERC721Controlled();
    result.initialize(name, symbol, baseURI, msg.sender);
    emit ERC721ControlledCreated(address(result));
    return result;
  }
}
