// SPDX-License-Identifier: GPL 3.0

pragma solidity ^0.8.9;
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol"; 
import "@openzeppelin/contracts/access/Ownable.sol";


contract MemeLord is ERC721URIStorage, Ownable {
    constructor() ERC721("MemeLord", "MLD") {
        
    }

    function mintToAddr(address _addr) external onlyOwner {
        _mint(_addr, 0);
        _setTokenURI(0, "https://meme.lord/");
        _mint(_addr, 1);
        _setTokenURI(1, "https://meme.lord/");
        _mint(_addr, 2);
        _setTokenURI(2, "https://meme.lord/");
        _mint(_addr, 3);
        _setTokenURI(3, "https://meme.lord/");
        _mint(_addr, 4);
        _setTokenURI(4, "https://meme.lord/");
        _mint(_addr, 5);
        _setTokenURI(5, "https://meme.lord/");
        _mint(_addr, 6);
        _setTokenURI(6, "https://meme.lord/");
        _mint(_addr, 7);
        _setTokenURI(7, "https://meme.lord/");
        _mint(_addr, 8);
        _setTokenURI(8, "https://meme.lord/");
        _mint(_addr, 9);
        _setTokenURI(9, "https://meme.lord/");
    }

} 