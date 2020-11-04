// SPDX-License-Identifier: MIT

pragma solidity ^0.6.12;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title An ownable ERC721
/// @author Brendan Asselstine
/// @notice The owner may change the base URI
contract ERC721Ownable is ERC721, Ownable {

  /// @notice Emitted when the token is constructed
  event ERC721OwnableInitialized(
    string name,
    string symbol
  );

  /// @notice Emitted when the base URI is set
  event ERC721OwnableBaseURISet(
    string baseURI
  );

  constructor (
    string memory name,
    string memory symbol,
    string memory baseURI
  ) public ERC721(name, symbol) Ownable() {
    setBaseURI(baseURI);

    emit ERC721OwnableInitialized(name, symbol);
  }

  function setBaseURI(string memory _baseURI) public onlyOwner {
    _setBaseURI(_baseURI);

    emit ERC721OwnableBaseURISet(_baseURI);
  }

  function mint(address to) external returns (uint256) {
    uint256 tokenId = totalSupply().add(1);
    _mint(to, tokenId);
    return tokenId;
  }

}
