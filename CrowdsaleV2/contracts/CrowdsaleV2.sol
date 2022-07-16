// SPDX-License-Identifier: GPL 3.0

pragma solidity ^0.8.9;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./ERC20Mintable.sol";

contract CrowdsaleV2 is Ownable {
    ERC20Mintable internal ERC20Contract;
    uint256 internal immutable totalSupply;
    uint256 internal creationTime;
    uint256 internal totalBuyin;
    mapping(address => uint256) internal buyins;
    mapping(address => bool) internal collected;

    constructor(uint256 _total) {
        totalSupply = _total * 10**18;
    }

    function start(address ERC20Address) external {
        ERC20Contract = ERC20Mintable(ERC20Address);
        creationTime = block.timestamp;
    }

    function buy() external payable {
        require(
            block.timestamp <= creationTime + 3 days,
            "Buy-in phase is over!"
        );

        unchecked {
            buyins[tx.origin] += msg.value;
            totalBuyin += msg.value;
        }
    }

    function collectEth() external onlyOwner {
        require(
            block.timestamp > creationTime + 3 days,
            "Buy-in phase is not finished!"
        );
        payable(tx.origin).transfer(address(this).balance);
    }

    function withdraw() external {
        require(
            block.timestamp > creationTime + 3 days,
            "Buy-in phase is not finished!"
        );
        require(
            !collected[tx.origin],
            "You have already withdrew your tokens!"
        );
        collected[tx.origin] = true;
        ERC20Contract.mint(
            tx.origin,
            (buyins[tx.origin] * totalSupply) / totalBuyin
        );
    }

    function getBuyin(address _addr) external view returns (uint256) {
        return buyins[_addr];
    }

    function getTotalBuyin() external view returns (uint256) {
        return totalBuyin;
    }
}
