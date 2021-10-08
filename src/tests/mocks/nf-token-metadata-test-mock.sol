// SPDX-License-Identifier: MIT
pragma solidity 0.8.6;

import "../../contracts/mocks/nf-token-metadata-mock.sol";

contract NFTokenMetadataTestMock is
  NFTokenMetadataMock
{

  constructor(
    string memory _name,
    string memory _symbol,
    string memory _nftBaseUri
  )
    NFTokenMetadataMock(_name, _symbol, _nftBaseUri)
  {
  }

}
