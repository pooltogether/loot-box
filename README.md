# Loot Boxes

Loot Boxes are Ethereum smart contracts that can be traded like NFTs and plundered by the owner.

There are three contracts in this project:

- **LootBox**: An ERC721 that allows users to mint new Loot Boxes.
- **LootBoxContainer**: The smart contract that implements the Loot Box behaviour.
- **LootBoxFactory**: A factory contract that creates new LootBox contracts using the minimal proxy pattern

# Usage






To create a new LootBox call `mint()`:



## Development

First clone the repository then run:

```bash
$ yarn
```

Now run the tests:

```bash
$ yarn test
```