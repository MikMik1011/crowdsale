pragma solidity ^0.7.3;
import "hardhat/console.sol";

contract Authentication {
  mapping(address => bool) internal users;

  function register() external {
    users[msg.sender] = true;
  }

  function checkAuth(address _addr) public view returns (bool) {
    return users[_addr];
  }

  modifier authModifier {
    require(checkAuth(msg.sender), "Authentication: not registered");
    _;
  }

}