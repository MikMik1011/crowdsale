import { ethers } from "hardhat";
import chai from "chai";
import { solidity } from "ethereum-waffle";
import { Authentication } from "../typechain/Authentication";

chai.use(solidity);
const { expect } = chai;

function generateErrorMsg(error: any) {
	return `VM Exception while processing transaction: reverted with reason string '${error}'`;
}

describe("Authentication", () => {
    let auth : Authentication;
    let signers : any[];

    beforeEach(async () => {
         signers = await ethers.getSigners();
        const authFactory = await ethers.getContractFactory(
            "Authentication",
            signers[0]
        );
        auth = (await authFactory.deploy()) as Authentication;
        await auth.deployed();

        expect(auth.address).to.properAddress;
    });

    it("should register an address and return true on authentication", async () => {
        await auth.register();

        expect(await auth.checkAuth(signers[0].address)).to.be.true;
    })

    it("should return false when authenticating non-registered address", async () => {
        expect(await auth.checkAuth(signers[0].address)).to.be.false;
    })

});