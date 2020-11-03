// SPDX-License-Identifier: MIT

pragma solidity ^0.6.12;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/utils/Create2.sol";

import "./external/pooltogether/MinimalProxyLibrary.sol";
import "./LootBox.sol";

contract LootBoxController {

  LootBox public lootBoxActionInstance;
  bytes public lootBoxActionBytecode;

  event Plundered(address indexed erc721, uint256 indexed tokenId, address indexed operator);
  event Executed(address indexed erc721, uint256 indexed tokenId, address indexed operator);

  constructor () public {
    lootBoxActionInstance = new LootBox();
    lootBoxActionBytecode = MinimalProxyLibrary.minimalProxy(address(lootBoxActionInstance));
  }

  function computeAddress(address erc721, uint256 tokenId) external view returns (address) {
    return Create2.computeAddress(_salt(erc721, tokenId), keccak256(lootBoxActionBytecode));
  }

  function plunder(
    address erc721,
    uint256 tokenId,
    IERC20[] calldata erc20s,
    LootBox.WithdrawERC721[] calldata erc721s,
    LootBox.WithdrawERC1155[] calldata erc1155s
  ) external {
    address payable owner = payable(IERC721(erc721).ownerOf(tokenId));
    LootBox lootBoxAction = _createLootBox(erc721, tokenId);
    lootBoxAction.plunder(erc20s, erc721s, erc1155s, owner);
    lootBoxAction.destroy(owner);

    emit Plundered(erc721, tokenId, msg.sender);
  }

  function executeCalls(
    address erc721,
    uint256 tokenId,
    LootBox.Call[] calldata calls
  ) external returns (bytes[] memory) {
    address payable owner = payable(IERC721(erc721).ownerOf(tokenId));
    require(msg.sender == owner, "LootBoxController/only-owner");
    LootBox lootBoxAction = _createLootBox(erc721, tokenId);
    bytes[] memory result = lootBoxAction.executeCalls(calls);
    lootBoxAction.destroy(owner);

    emit Executed(erc721, tokenId, msg.sender);

    return result;
  }

  function _createLootBox(address erc721, uint256 tokenId) internal returns (LootBox) {
    return LootBox(payable(Create2.deploy(0, _salt(erc721, tokenId), lootBoxActionBytecode)));
  }

  function _salt(address erc721, uint256 tokenId) internal pure returns (bytes32) {
    return keccak256(abi.encodePacked(erc721, tokenId));
  }
}
