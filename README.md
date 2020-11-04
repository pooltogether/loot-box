# Loot Boxes

Loot Boxes are Ethereum smart contracts that can be traded like NFTs and plundered by the owner.

There are two contracts in this project:

- **LootBox**: A counterfactually-created contract that allows the user to execute arbitrary calls & withdraw tokens
- **LootBoxController**: A contract that associates an address with an ERC721 and allows anyone to "plunder" the address: withdrawing desired tokens to the ERC721 owner's address.

# Usage

First compute the address of the LootBox using the LootBoxController:

```solidity
lootBoxAddress = lootBoxController.computeAddress(erc721Address, tokenId);
```

Now transfer tokens to that address; they could be ERC20s, ERC721s, or ERC1155s.

When you're ready, withdraw the tokens:

```solidity
lootBoxController.plunder(erc721Address, tokenId, [erc20Address], [], [])
```

See the code to understand the parameters.

## Development

First clone the repository then run:

```bash
$ yarn
```

Now run the tests:

```bash
$ yarn test
```