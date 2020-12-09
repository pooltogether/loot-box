// SPDX-License-Identifier: MIT

pragma solidity ^0.6.12;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";

contract ERC20Mintable is ERC20Upgradeable {

  constructor (
    string memory name,
    string memory symbol
  ) public {
    __ERC20_init(name, symbol);
  }

  function mint(address to, uint256 amount) external returns (address) {
    _mint(to, amount);
  }

}
