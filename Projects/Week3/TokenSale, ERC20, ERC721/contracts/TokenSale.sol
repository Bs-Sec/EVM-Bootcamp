// Smart Contract Features
// Buy ERC20 tokens with ETH for a fixed ratio
// Ratio r means that 1 ETH should buy r tokens
// Withdraw ETH by burning the ERC20 tokens at the contract
// Mint a new ERC721 for a configured price
// Price p means that 1 NFT should cost p tokens
// Allow users to burn their NFTs to recover half of the purchase price
// Update owner withdrawable amount whenever a NFT is sold
// Allow owner to withdraw tokens from the contract
// Only half of sales value is available for withdraw

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {MyToken} from "./myERC20.sol";
import {MyNFT} from "./myERC271.sol";

contract TokenSale is Ownable {
    uint256 public ratio;
    uint256 public price;
    MyToken public paymentToken;
    MyNFT public nftContract;

    constructor(
        uint256 _ratio,
        uint256 _price,
        MyToken _paymentToken,
        MyNFT _nftContract
    ) Ownable(msg.sender) {
        ratio = _ratio;
        price = _price;
        paymentToken = _paymentToken;
        nftContract = _nftContract;
    }

    function buyTokens() external payable {
        // mint msg.value * ratio to msg.sender
        paymentToken.mint(msg.sender, msg.value * ratio);
    }

    function returnTokens(uint256 amount) external {
        paymentToken.burnFrom(msg.sender, amount);
        payable(msg.sender).transfer(amount / ratio);
    }
}
