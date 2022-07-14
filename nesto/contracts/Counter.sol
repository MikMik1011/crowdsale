pragma solidity ^0.7.3;
import "hardhat/console.sol";
import "./Authentication.sol";
contract Counter is Authentication {

  uint256 internal count = 0;
  uint256 internal creationTime_;
  //Authentication internal authContract;
  event CountedTo(uint256 number);

  constructor() {
    //authContract = Authentication(_addr);
    creationTime_ = block.timestamp;
  }

  function hello() view external {
        require(block.timestamp > creationTime_ + 1 hours);
    }
  
  function countUp() external authModifier {
    //require(authContract.checkAuth(msg.sender), "Authentication: not registered");
    
    uint256 newCount = count + 1;
    require(newCount > count, "Uint256 overflow");
    
    count = newCount;
    emit CountedTo(count);
  }
  function countDown() external authModifier {
    //require(authContract.checkAuth(msg.sender), "Authentication: not registered");

    uint256 newCount = count - 1;
    require(newCount < count, "Uint256 underflow");
    count = newCount;
    emit CountedTo(count);
  }

  function countToMax() external authModifier {
    //require(authContract.checkAuth(msg.sender), "Authentication: not registered");
    
    count = type(uint256).max;
    emit CountedTo(count);
  }

  // getters go here
  function getCount() external view returns (uint256) {
    return count;
  }
}