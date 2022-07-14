pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract CedevitoCoin is ERC20 {
    constructor(uint256 total) ERC20("CedevitoCoin", "CDC") {
        _mint(msg.sender, total);
    }   
}