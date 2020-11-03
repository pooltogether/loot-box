// SPDX-License-Identifier: MIT

pragma solidity ^0.6.12;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";

contract LootBox {

  struct Call {
    address to;
    uint256 value;
    bytes data;
  }

  struct WithdrawERC721 {
    IERC721 token;
    uint256[] tokenIds;
  }

  struct WithdrawERC1155 {
    IERC1155 token;
    uint256[] ids;
    uint256[] amounts;
    bytes data;
  }

  event WithdrewERC20(address indexed token, uint256 amount);
  event WithdrewERC721(address indexed token, uint256[] tokenIds);
  event WithdrewERC1155(address indexed token, uint256[] ids, uint256[] amounts, bytes data);
  event ReceivedEther(address indexed sender, uint256 amount);
  event TransferredEther(address indexed to, uint256 amount);

  function executeCalls(Call[] calldata calls) external returns (bytes[] memory) {
    bytes[] memory response = new bytes[](calls.length);
    for (uint256 i = 0; i < calls.length; i++) {
      response[i] = _executeCall(calls[i].to, calls[i].value, calls[i].data);
    }
    return response;
  }

  receive() external payable {
    emit ReceivedEther(msg.sender, msg.value);
  }

  function transferEther(address payable to, uint256 amount) public {
    to.transfer(amount);

    emit TransferredEther(to, amount);
  }

  function plunder(
    IERC20[] memory erc20,
    WithdrawERC721[] memory erc721,
    WithdrawERC1155[] memory erc1155,
    address payable to
  ) external {
    _withdrawERC20(erc20, to);
    _withdrawERC721(erc721, to);
    _withdrawERC1155(erc1155, to);
    transferEther(to, address(this).balance);
  }

  function destroy(address payable to) external {
    selfdestruct(to);
  }

  function _executeCall(address to, uint256 value, bytes memory data) internal returns (bytes memory) {
    (bool succeeded, bytes memory returnValue) = to.call{value: value}(data);
    require(succeeded, string(returnValue));
    return returnValue;
  }

  function _withdrawERC20(IERC20[] memory tokens, address to) internal {
    for (uint256 i = 0; i < tokens.length; i++) {
      uint256 balance = tokens[i].balanceOf(address(this));
      tokens[i].transfer(to, balance);

      emit WithdrewERC20(address(tokens[i]), balance);
    }
  }

  function _withdrawERC721(WithdrawERC721[] memory withdrawals, address to) internal {
    for (uint256 i = 0; i < withdrawals.length; i++) {
      for (uint256 tokenIndex = 0; tokenIndex < withdrawals[i].tokenIds.length; tokenIndex++) {
        withdrawals[i].token.transferFrom(address(this), to, withdrawals[i].tokenIds[tokenIndex]);
      }

      emit WithdrewERC721(address(withdrawals[i].token), withdrawals[i].tokenIds);
    }
  }

  function _withdrawERC1155(WithdrawERC1155[] memory withdrawals, address to) internal {
    for (uint256 i = 0; i < withdrawals.length; i++) {
      withdrawals[i].token.safeBatchTransferFrom(address(this), to, withdrawals[i].ids, withdrawals[i].amounts, withdrawals[i].data);

      emit WithdrewERC1155(address(withdrawals[i].token), withdrawals[i].ids, withdrawals[i].amounts, withdrawals[i].data);
    }
  }

}
