# Loot Boxes

[![CircleCI](https://circleci.com/gh/pooltogether/loot-box.svg?style=svg)](https://circleci.com/gh/pooltogether/loot-box)
[![Coverage Status](https://coveralls.io/repos/github/pooltogether/loot-box/badge.svg?branch=main)](https://coveralls.io/github/pooltogether/loot-box?branch=main)

Loot Boxes are Ethereum smart contracts that can be traded like NFTs and plundered for tokens.

Supported tokens:

- ERC20
- ERC721
- ERC777 (only if it implements ERC20)
- ERC1155

# Usage

There are two main smart contracts:

- **LootBoxController**: A contract that associates an address with an ERC721 and allows anyone to "plunder" the address: withdrawing desired tokens to the ERC721 owner's address.
- **LootBox**: A contract that allows anyone to execute arbitrary calls & withdraw tokens.  It is created and destroyed by the LootBoxController in a single transaction.

The user flow is like so:

1. The Loot Box Controller computes the Loot Box address for *any ERC721*.
2. Anyone can transfer tokens to the Loot Box address
3. Anyone may call the Loot Box Controller to transfer tokens from the Loot Box address to the current owner of the ERC721.

When the Loot Box controller withdraws tokens from a Loot Box, it's actually using CREATE2 to create a minimal proxy instance of a Loot Box.  After the tokens are transferred, the Loot Box contract is destroyed.  This cheap deployment and immediate destruction of the contract minimizes the gas overhead.

# API

## LootBoxController

```solidity
computeAddress(address erc721, uint256 tokenId)
```

Computes the address of the Loot Box for the given ERC721.  Returns the address of the Loot Box.

Note that no contract will exist there.  The Loot Box contract is created and destroyed in a single tx.

```solidity
plunder(
  address erc721,
  uint256 tokenId,
  address[] calldata erc20s,
  WithdrawERC721[] calldata erc721s,
  WithdrawERC1155[] calldata erc1155s
)
```

Transfers all of the given tokens in the Loot Box to the owner of the ERC721.

`erc20s` is an array of ERC20 token addresses. The full balance of each will be transferred to the ERC721 owner.

`erc721s` is an array of `WithdrawERC721` objects:

```solidity
struct WithdrawERC721 {
  address token;
  uint256[] tokenIds;
}
```

`erc1155s` is an array of `WithdrawERC1155` objects:

```solidity
struct WithdrawERC1155 {
  address token;
  uint256[] ids;
  uint256[] amounts;
  bytes data;
}
```

The gas usage of `plunder` is quite reasonable.  When withdrawing 2 ERC20s, 1 ERC721s and 1 ERC1155 the gas cost is ~211k.  This is based on the standard OpenZeppelin token implementations.

## Development

First clone the repository then run:

```bash
$ yarn
```

Now run the tests:

```bash
$ yarn test
```

Run code coverage:

```bash
$ yarn coverage
```

Run gas checks:

```bash
# start a node
$ yarn start-gas
# run the tests with gas reporter
$ yarn gas
```
