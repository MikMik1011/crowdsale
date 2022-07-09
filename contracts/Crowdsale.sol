// SPDX-License-Identifier: GPL 3.0

pragma solidity ^0.8.9;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Crowdsale is ERC20, Ownable {
    uint256 internal creationTime_;
    uint256 internal totalBuyin;
    mapping(address => uint256) internal buyins;
    mapping(address => bool) internal collected;

    constructor(uint256 total) ERC20("Crowdsale", "CRS") {
        _mint(address(this), total * (10 ** decimals()));
        creationTime_ = block.timestamp;
    }

    function buy() external payable {
        require(block.timestamp <= creationTime_ + 3 days, "Buy-in phase is over!");
        buyins[msg.sender] += msg.value;
        totalBuyin += msg.value;
    }

    function getBuyin(address _addr) external view returns (uint256) {
        return buyins[_addr];
    }

    function getTotalBuyin() external view returns (uint256) {
        return totalBuyin;
    }

    function collectEth() external onlyOwner {
        require(block.timestamp > creationTime_ + 3 days, "Buy-in phase is not finished!");
        payable(msg.sender).transfer(address(this).balance);
    }

    function withdraw() external {
        require(block.timestamp > creationTime_ + 3 days, "Buy-in phase is not finished!");
        require(!collected[msg.sender], "You have already withdrew your tokens!");
        collected[msg.sender] = true;
        _transfer(address(this), msg.sender, buyins[msg.sender] * totalSupply() / totalBuyin);
    }
}

