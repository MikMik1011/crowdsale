pragma solidity ^0.8.9;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Crowdsale is ERC20, Ownable {
    uint256 internal totalSupply_;
    uint256 internal creationTime_;
    uint256 internal totalBuyin;
    mapping(address => uint256) internal buyins;

    constructor(uint256 total) ERC20("Crowdsale", "CRS") {
        totalSupply_ = total;
        creationTime_ = block.timestamp;
    }

    function buy() external payable {
        require(block.timestamp < creationTime_ + 3 days, "Buy-in phase is over!");
        buyins[msg.sender] += msg.value;
        totalBuyin += msg.value;
    }
}