pragma solidity ^0.6.12;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC721/IERC721.sol";

import "./external/openzeppelin/IERC1155.sol";

interface LootBoxInterface {

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

  event WithdrewERC20(address indexed token);
  event WithdrewERC721(address indexed token, uint256[] tokenIds);
  event WithdrewERC1155(address indexed token, uint256[] ids, uint256[] amounts, bytes data);
  event ReceivedEther(address indexed sender, uint256 amount);
  event TransferredEther(address indexed to, uint256 amount);

  function executeCalls(Call[] calldata calls) external returns (bytes[] memory);
  function withdrawERC20(IERC20[] memory tokens) external;
  function withdrawERC721(WithdrawERC721[] memory withdrawals) external;
  function withdrawERC1155(WithdrawERC1155[] memory withdrawals) external;
  receive() external payable;
  function transferEther(address payable to, uint256 amount) external;
  function owner() external view returns (address);
  function isAuthorized(address user) external view returns (bool);
}
