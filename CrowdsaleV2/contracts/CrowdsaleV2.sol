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
