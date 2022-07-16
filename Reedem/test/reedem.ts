import { ethers } from 'hardhat';
import chai from 'chai';
import { solidity } from 'ethereum-waffle';
import { BigNumber } from 'ethers';
import { Reedem } from '../typechain/Reedem';
import { ERC20Mintable } from '../typechain/ERC20Mintable';

chai.use(solidity);
const { expect } = chai;

function generateErrorMsg(error: any) {
	return `VM Exception while processing transaction: reverted with reason string '${error}'`;
}

describe('Crowdsale', () => {
	let reedem: Reedem;
	let erc20mintable: ERC20Mintable;
	let reedemFactory: any;
	let signers: any[];

	beforeEach(async () => {
		signers = await ethers.getSigners();

		const erc20mintableFactory = await ethers.getContractFactory(
			'ERC20Mintable',
			signers[0]
		);
		erc20mintable = (await erc20mintableFactory.deploy(
			'Token',
			'TKN'
		)) as ERC20Mintable;
		await erc20mintable.deployed();

		expect(erc20mintable.address).to.properAddress;

		reedemFactory = await ethers.getContractFactory('Reedem', signers[0]);
		reedem = (await reedemFactory.deploy(erc20mintable.address, {
			value: ethers.utils.parseEther('0.2'),
		})) as Reedem;
		await reedem.deployed();

		expect(reedem.address).to.properAddress;

		await erc20mintable.addMinter(reedem.address);

		await erc20mintable.approve(reedem.address, ethers.utils.parseEther('20'));
		expect(
			await erc20mintable.allowance(signers[0].address, reedem.address)
		).to.eq(ethers.utils.parseEther('20'));

		await reedem.tokenz();
	});

	describe('reedem', () => {
		it('should reedem eth', async () => {
			expect(await erc20mintable.balanceOf(signers[0].address)).to.eq(
				ethers.utils.parseEther('10')
			);

			await expect(() => reedem.reedem()).to.changeEtherBalance(
				signers[0],
				ethers.utils.parseEther('0.1')
			);

			expect(await erc20mintable.balanceOf(signers[0].address)).to.eq(0);
		});

		it('should not reedem if token balance is less than 10', async () => {
			await reedem.reedem();

			expect(await erc20mintable.balanceOf(signers[0].address)).to.eq(0);

			await expect(reedem.reedem()).to.be.revertedWith(
				generateErrorMsg('ERC20: transfer amount exceeds balance')
			);
		});

		it('should not reedem if allowance is less than 10', async () => {
			await reedem.tokenz();

			await erc20mintable.approve(
				reedem.address,
				ethers.utils.parseEther('15')
			);
			expect(
				await erc20mintable.allowance(signers[0].address, reedem.address)
			).to.eq(ethers.utils.parseEther('15'));

			await reedem.reedem();

			expect(
				await erc20mintable.allowance(signers[0].address, reedem.address)
			).to.eq(ethers.utils.parseEther('5'));

			await expect(reedem.reedem()).to.be.revertedWith(
				generateErrorMsg('ERC20: insufficient allowance')
			);
		});

		it('should not reedem if eth balance is less than 0.1', async () => {
			await reedem.tokenz();
			await reedem.tokenz();

			await erc20mintable.approve(
				reedem.address,
				ethers.utils.parseEther('30')
			);
			expect(
				await erc20mintable.allowance(signers[0].address, reedem.address)
			).to.eq(ethers.utils.parseEther('30'));

			await reedem.reedem();
			await reedem.reedem();

			await expect(reedem.reedem()).to.be.revertedWith(
				generateErrorMsg("Contract doesn't have enough ether")
			);
		});
	});
});
