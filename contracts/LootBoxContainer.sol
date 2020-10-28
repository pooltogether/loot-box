pragma solidity ^0.6.12;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC721/IERC721.sol";

contract LootBoxContainer {

  IERC721 public erc721;

  event ReceivedEther(address indexed sender, uint256 amount);
  event TransferredEther(address indexed to, uint256 amount);

  struct Call {
    address to;
    uint256 value;
    bytes data;
  }

  function initialize(IERC721 _erc721) external {
    require(address(erc721) == address(0), "LootBoxContainer/already-initialized");
    erc721 = _erc721;
  }

  function executeCalls(Call[] calldata calls) external onlyOwner returns (bytes[] memory) {
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

  receive() external payable {
    emit ReceivedEther(msg.sender, msg.value);
  }

  function transferEther(address payable to, uint256 amount) external onlyOwner {
    to.transfer(amount);

    emit TransferredEther(to, amount);
  }

  modifier onlyOwner() {
    address owner = erc721.ownerOf(uint256(address(this)));
    require(msg.sender == owner, "LootBoxContainer/not-owner");
    _;
  }

}
