pragma solidity ^0.6.12;

import "../external/openzeppelin/ProxyFactory.sol";
import "./ERC721Mintable.sol";

contract ERC721MintableFactory is ProxyFactory {

  ERC721Mintable public erc721MintableInstance;

  constructor () public {
    erc721MintableInstance = new ERC721Mintable();
  }

  function create(
    string calldata name,
    string calldata symbol,
    string calldata baseURI_
  ) external returns (ERC721Mintable) {
    ERC721Mintable erc721 = ERC721Mintable(payable(deployMinimal(address(erc721MintableInstance), "")));
    erc721.initialize(name, symbol, baseURI_);
    return erc721;
  }

}
