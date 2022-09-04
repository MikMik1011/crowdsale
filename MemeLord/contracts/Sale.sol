// SPDX-License-Identifier: GPL 3.0

pragma solidity ^0.8.9;
import "./MemeLord.sol";

struct Bid {
    address bidder;
    uint256 amount;
}

contract Sale {
    MemeLord internal immutable memeLord;
    mapping(uint8 => Bid) internal highestBid;
    uint256 internal immutable creationTime;

    constructor(address _memeLordAddr) {
        memeLord = MemeLord(_memeLordAddr);
        creationTime = block.timestamp;
    }

    function bid(uint8 memeId, uint256 amount) external {
        require(memeId < 10, "Invalid memeId!");

        require(
            block.timestamp - creationTime <= 10 days,
            "Bidding is closed!"
        );
        require(amount > highestBid[memeId].amount, "Bid is too low!");

        highestBid[memeId] = Bid({bidder: msg.sender, amount: amount});
    }

    function withdrawNFT(uint8 memeId) external payable {
        require(memeId < 10, "Invalid memeId!");

        require(
            block.timestamp - creationTime > 10 days,
            "Bidding is still open!"
        );

        require(highestBid[memeId].amount > 0, "Meme is not on sale anymore!");

        if (block.timestamp - creationTime <= 10 days + 1 hours)
            require(
                highestBid[memeId].bidder == msg.sender,
                "The highest bidder didn't withdraw NFT yet!"
            );

        require(
            this.getHighestBid(memeId) == msg.value,
            "You did not pay the correct amount!"
        );

        delete highestBid[memeId];
        memeLord.transferFrom(address(this), msg.sender, memeId);
    }

    function getHighestBid(uint8 memeId)
        external
        view
        returns (uint256 amount)
    {
        uint256 _timePassed = block.timestamp - creationTime;
        if (_timePassed <= 10 days + 1 hours) return highestBid[memeId].amount;
        else {
            _timePassed = (_timePassed - 10 days) / 1 hours;
            return
                (highestBid[memeId].amount * 9**_timePassed) / 10**_timePassed;
        }
    }
}
