// SPDX-License-Identifier: GPL 3.0

pragma solidity ^0.8.9;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ERC20Mintable is ERC20, Ownable {
    mapping(address => bool) internal minters;

    event Mint(address indexed to, uint256 amount);

    constructor(string memory name, string memory symbol) ERC20(name, symbol) {}

    function addMinter(address minter) external onlyOwner {
        require(minter != address(0), "Minter cannot be the zero address");
        require(!isMinter(minter), "Minter is already added");
        minters[minter] = true;
    }

    function removeMinter(address minter) external onlyOwner {
        require(minter != address(0), "Minter cannot be the zero address");
        require(isMinter(minter), "Minter is not added");
        minters[minter] = false;
    }

    function isMinter(address minter) internal view returns (bool) {
        return minters[minter];
    }

    function mint(address to, uint256 amount) external {
        require(isMinter(msg.sender), "Only minter can mint");
        _mint(to, amount);
        emit Mint(to, amount);
    }
}