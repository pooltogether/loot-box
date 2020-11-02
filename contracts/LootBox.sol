pragma solidity ^0.6.12;
pragma experimental ABIEncoderV2;

import "./LootBoxInterface.sol";

abstract contract LootBox is LootBoxInterface {

  function executeCalls(Call[] calldata calls) external override onlyAuthorized returns (bytes[] memory) {
    bytes[] memory response = new bytes[](calls.length);
    for (uint256 i = 0; i < calls.length; i++) {
      response[i] = _executeCall(calls[i].to, calls[i].value, calls[i].data);
    }
    return response;
  }

  function _executeCall(address to, uint256 value, bytes memory data) internal returns (bytes memory) {
    (bool succeeded, bytes memory returnValue) = to.call{value: value}(data);
    require(succeeded, string(returnValue));
    return returnValue;
  }

  receive() external override payable {
    emit ReceivedEther(msg.sender, msg.value);
  }

  function transferEther(address payable to, uint256 amount) external override onlyAuthorized {
    to.transfer(amount);

    emit TransferredEther(to, amount);
  }

  function withdrawERC20(IERC20[] memory tokens) external override {
    for (uint256 i = 0; i < tokens.length; i++) {
      tokens[i].transfer(owner(), tokens[i].balanceOf(address(this)));

      emit WithdrewERC20(address(tokens[i]));
    }
  }

  function withdrawERC721(WithdrawERC721[] memory withdrawals) external override {
    for (uint256 i = 0; i < withdrawals.length; i++) {
      for (uint256 tokenIndex = 0; tokenIndex < withdrawals[i].tokenIds.length; tokenIndex++) {
        withdrawals[i].token.transferFrom(address(this), owner(), withdrawals[i].tokenIds[tokenIndex]);
      }

      emit WithdrewERC721(address(withdrawals[i].token), withdrawals[i].tokenIds);
    }
  }

  function withdrawERC1155(WithdrawERC1155[] memory withdrawals) external override {
    for (uint256 i = 0; i < withdrawals.length; i++) {
      withdrawals[i].token.safeBatchTransferFrom(address(this), owner(), withdrawals[i].ids, withdrawals[i].amounts, withdrawals[i].data);

      emit WithdrewERC1155(address(withdrawals[i].token), withdrawals[i].ids, withdrawals[i].amounts, withdrawals[i].data);
    }
  }

  function owner() public override virtual view returns (address);

  function isAuthorized(address sender) public override virtual view returns (bool) {
    return owner() == sender;
  }

  modifier onlyAuthorized() {
    require(isAuthorized(msg.sender), "LootBoxContainer/not-authorized");
    _;
  }

}
