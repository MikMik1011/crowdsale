// SPDX-License-Identifier: GPL 3.0

pragma solidity ^0.8.9;
import "./ERC20Mintable.sol";

contract Reedem {
    ERC20Mintable internal immutable Token;

    constructor(address tokenaddr) payable {
        Token = ERC20Mintable(tokenaddr);
    }

    function tokenz() external {
        Token.mint(tx.origin, 10 * 10**18);
    }

    function reedem() external {
        require(
            address(this).balance >= 1 ether / 10,
            "Contract doesn't have enough ether"
        );
        Token.transferFrom(tx.origin, address(this), 10 * 10**18);
        payable(tx.origin).transfer(1 ether / 10);
    }
}
