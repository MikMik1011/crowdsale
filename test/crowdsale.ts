import { ethers } from "hardhat";
import chai from "chai";
import { solidity } from "ethereum-waffle";
import { BigNumber } from 'ethers';
import { Crowdsale } from "../typechain/Crowdsale";


chai.use(solidity);
const { expect } = chai;

function generateErrorMsg(error: any) {
	return `VM Exception while processing transaction: reverted with reason string '${error}'`;
}

describe("Crowdsale", () => {
    let crowdsale: Crowdsale;
    let signers: any[];

    beforeEach(async () => {
        signers = await ethers.getSigners();

        const crowdsaleFactory = await ethers.getContractFactory(
            "Crowdsale",
            signers[0]
        );
        crowdsale = (await crowdsaleFactory.deploy(10)) as Crowdsale;
        await crowdsale.deployed();

        expect(crowdsale.address).to.properAddress;
    });

    describe("buy", async () => {
            
            it("should register buy-in", async () => {
                await crowdsale.buy({ value: ethers.utils.parseEther("1") });
                expect(await crowdsale.getBuyin(signers[0].address)).to.eq(BigNumber.from(10).pow(18));
            })
            
            it("should revert after buy-in phase", async () => {
                await ethers.provider.send("evm_increaseTime", [(3 * 24 * 60 * 60) + 1]);
                await ethers.provider.send("evm_mine", []);
                await expect(crowdsale.buy({ value: ethers.utils.parseEther("1")})).to.be.revertedWith(generateErrorMsg("Buy-in phase is over!"));
            });


    });
});