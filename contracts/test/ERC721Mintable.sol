pragma solidity ^0.6.12;

import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC721/ERC721.sol";

contract ERC721Mintable is ERC721UpgradeSafe {

  event ERC721Initialized(
    string name,
    string symbol,
    string baseURI
  );

  uint256 public id;

  function initialize (
    string calldata name,
    string calldata symbol,
    string calldata baseURI_
  ) external initializer {
    __ERC721_init(name, symbol);
    _setBaseURI(baseURI_);

    emit ERC721Initialized(name, symbol, baseURI_);
  }

  function mint() external returns (address) {
    _mint(_msgSender(), ++id);
  }

}
