// SPDX-License-Identifier: MIT

pragma solidity ^0.6.12;

import "@openzeppelin/contracts-upgradeable/token/ERC777/ERC777Upgradeable.sol";

contract ERC777Mintable is ERC777Upgradeable {

  constructor (
    string memory name,
    string memory symbol,
    address[] memory defaultOperators
  ) public {
    __ERC777_init(name, symbol, defaultOperators);
  }

  function mint(address to, uint256 amount, bytes memory userData, bytes memory operatorData) external returns (address) {
    _mint(to, amount, userData, operatorData);
  }

}
