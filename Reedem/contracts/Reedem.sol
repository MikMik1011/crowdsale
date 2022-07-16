// SPDX-License-Identifier: GPL 3.0

pragma solidity ^0.8.9;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Reedem is ERC20 {
    constructor () payable ERC20("Token", "TKN") {
        _mint(msg.sender, 10 ether);
    }

    function reedem() external {
        require(
            address(this).balance >= 1 ether / 10,
            "Contract doesn't have enough ether"
        );
        transferFrom(msg.sender, address(this), 10 ether);
        payable(msg.sender).transfer(1 ether / 10);
    }
}
