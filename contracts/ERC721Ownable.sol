// SPDX-License-Identifier: MIT

pragma solidity ^0.6.12;

import "./external/openzeppelin/ERC721.sol";
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

  uint256 internal _totalSupply;

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
    _totalSupply = _totalSupply.add(1);
    _mint(to, _totalSupply);
    return _totalSupply;
  }

  function totalSupply() external view returns (uint256) {
    return _totalSupply;
  }

}
