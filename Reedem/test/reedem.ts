import { ethers } from 'hardhat';
import chai from 'chai';
import { solidity } from 'ethereum-waffle';
import { BigNumber } from 'ethers';
import { Reedem } from '../typechain/Reedem';

chai.use(solidity);
const { expect } = chai;

function generateErrorMsg(error: any) {
	return `VM Exception while processing transaction: reverted with reason string '${error}'`;
}

describe('Crowdsale', () => {
	let reedem: Reedem;
	let reedemFactory: any;
	let signers: any[];

	beforeEach(async () => {
		signers = await ethers.getSigners();

		reedemFactory = await ethers.getContractFactory('Reedem', signers[0]);
		reedem = (await reedemFactory.deploy({
			value: ethers.utils.parseEther('0.1'),
		})) as Reedem;
		await reedem.deployed();

		expect(reedem.address).to.properAddress;

		await reedem.approve(reedem.address, ethers.utils.parseEther('10'));
		expect(await reedem.allowance(signers[0].address, reedem.address)).to.eq(
			ethers.utils.parseEther('10')
		);
	});

	describe('reedem', () => {
		it('should reedem eth', async () => {
			expect(await reedem.balanceOf(signers[0].address)).to.eq(
				ethers.utils.parseEther('10')
			);
			await expect(() => reedem.reedem()).to.changeEtherBalance(
				signers[0],
				ethers.utils.parseEther('0.1')
			);
			expect(await reedem.balanceOf(signers[0].address)).to.eq(0);
		});

		it('should not reedem if token balance is less than 10', async () => {
			await reedem.reedem();
			expect(await reedem.balanceOf(signers[0].address)).to.eq(0);
			await expect(reedem.reedem()).to.be.revertedWith(
				generateErrorMsg('ERC20: transfer amount exceeds balance')
			);
		});

		it.skip('should not reedem if eth balance is less than 0.1', async () => {
			reedem = (await reedemFactory.deploy()) as Reedem;
			await reedem.deployed();

			expect(reedem.address).to.properAddress;

			await expect(reedem.reedem()).to.be.revertedWith(
				generateErrorMsg("Contract doesn't have enough ether")
			);
		});
	});
});
