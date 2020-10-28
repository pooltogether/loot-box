# Loot Boxes

Loot Boxes are Ethereum smart contracts that can be traded like NFTs and plundered by the owner.

There are three contracts in this project:

- **LootBox**: An ERC721 that allows users to mint new Loot Boxes.
- **LootBoxContainer**: The smart contract that implements the Loot Box behaviour.
- **LootBoxFactory**: A factory contract that creates new LootBox contracts using the minimal proxy pattern

# Networks

## Rinkeby

| Contract | Address |
| :--- | :--- |
| LootBoxFactory | [0xB3a87172F555ae2a2AB79Be60B336D2F7D0187f0](https://rinkeby.etherscan.io/address/0xB3a87172F555ae2a2AB79Be60B336D2F7D0187f0) |
| Example Loot Box | [0xf362ce295f2a4eae4348ffc8cdbce8d729ccb8eb](https://rinkeby.etherscan.io/address/0xf362ce295f2a4eae4348ffc8cdbce8d729ccb8eb) |

# Usage

1. Create a Loot Box contract using the Loot Box Factory.  
2. Mint a Loot Box token using the Loot Box contract.
3. The token's id is actually an Ethereum address- now transfer tokens to that address!
4. If you like you plunder the Loot Box; as the owner you can execute arbitrary code from the token address.
5. When you're ready, transfer the token to someone else using the Loot Box contract.  It's an ERC721.

## Development

First clone the repository then run:

```bash
$ yarn
```

Now run the tests:

```bash
$ yarn test
```