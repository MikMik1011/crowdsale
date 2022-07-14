import { ethers } from "hardhat";
import chai from "chai";
import { solidity } from "ethereum-waffle";
import { BigNumber } from 'ethers';

import { Counter } from "../typechain/Counter";
//import { Authentication } from "../typechain/Authentication";


chai.use(solidity);
const { expect } = chai;

function generateErrorMsg(error: any) {
	return `VM Exception while processing transaction: reverted with reason string '${error}'`;
}

describe("Counter", () => {
    let counter: Counter;
    //let auth : Authentication;
    let signers : any[];

    beforeEach(async () => {
        signers = await ethers.getSigners();

        /*const authFactory = await ethers.getContractFactory(
            "Authentication",
            signers[0]
        );
        auth = (await authFactory.deploy()) as Authentication;
        await auth.deployed();

        expect(auth.address).to.properAddress;*/

        const counterFactory = await ethers.getContractFactory(
            "Counter",
            signers[0]
        );
        counter = (await counterFactory.deploy()) as Counter;
        await counter.deployed();

        expect(counter.address).to.properAddress;

        await counter.register();
        expect(await counter.checkAuth(signers[0].address)).to.be.true;
    });

    describe("count up", async () => {

        it("should count up", async () => {
            await counter.countUp();
            let count = await counter.getCount();
            expect(count).to.eq(BigNumber.from(1));
        });

        it("should emit an event on countUp", async () => {
            await expect(counter.countUp()).to.emit(counter, "CountedTo").withArgs(BigNumber.from(1));
        });

        it("should fail on overflow", async () => {
            await counter.countToMax();
            await expect(counter.countUp()).to.be.revertedWith(generateErrorMsg("Uint256 overflow"));
        });

        it("should revert on non-registered address", async () => {
            counter = await counter.connect(signers[1]);
            await expect(counter.countUp()).to.be.revertedWith(generateErrorMsg("Authentication: not registered"));
        })

    });

    describe("count down", async () => {
        
        it("should count down", async () => {
            await counter.countUp();
            await counter.countDown();
            const count = await counter.getCount();
            expect(count.toString()).to.eq(BigNumber.from(0));
        });

        it("should emit an event on countDown", async () => {
            await counter.countUp();
            await expect(counter.countDown()).to.emit(counter, "CountedTo").withArgs(BigNumber.from(0));
        });

        it("should fail on underflow", async () => {
            await expect(counter.countDown()).to.be.revertedWith(generateErrorMsg("Uint256 underflow"));
        });

        it("should revert on non-registered address", async () => {
            counter = await counter.connect(signers[1]);
            await expect(counter.countDown()).to.be.revertedWith(generateErrorMsg("Authentication: not registered"));
        })
    });

    describe("count to max", async () => {
            
            it("should count to max", async () => {
                await counter.countToMax();
                const count = await counter.getCount();
                expect(count.toString()).to.eq(BigNumber.from("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"));
            });

            it("should emit an event on countToMax", async () => {
                await expect(counter.countToMax()).to.emit(counter, "CountedTo").withArgs(BigNumber.from("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"));
            });

            it("should revert on non-registered address", async () => {
                counter = await counter.connect(signers[1]);
                await expect(counter.countToMax()).to.be.revertedWith(generateErrorMsg("Authentication: not registered"));
            })
    });

});