import { ethers } from 'hardhat';
import chai from 'chai';
import { solidity } from 'ethereum-waffle';
import { BigNumber } from 'ethers';
import { CrowdsaleV2 } from '../typechain/CrowdsaleV2';
import { ERC20Mintable } from '../typechain/ERC20Mintable';

chai.use(solidity);
const { expect } = chai;

function generateErrorMsg(error: any) {
	return `VM Exception while processing transaction: reverted with reason string '${error}'`;
}

describe('CrowdsaleV2', () => {
	let crowdsalev2: CrowdsaleV2;
	let erc20mintable: ERC20Mintable;
	let signers: any[];

	beforeEach(async () => {
		signers = await ethers.getSigners();

		const crowdsalev2Factory = await ethers.getContractFactory(
			'CrowdsaleV2',
			signers[0]
		);
		crowdsalev2 = (await crowdsalev2Factory.deploy(4)) as CrowdsaleV2;
		await crowdsalev2.deployed();

		expect(crowdsalev2.address).to.properAddress;


		const erc20mintableFactory = await ethers.getContractFactory(
			'ERC20Mintable',
			signers[0]
		);
		erc20mintable = (await erc20mintableFactory.deploy("Crowdsale V2", "CRS2")) as ERC20Mintable;
		await erc20mintable.deployed();

		expect(erc20mintable.address).to.properAddress;

		await erc20mintable.addMinter(crowdsalev2.address);
		await crowdsalev2.start(erc20mintable.address);
	});

	describe('buy', async () => {
		it('should register buy-in', async () => {
			await crowdsalev2.buy({ value: ethers.utils.parseEther('1') });
            
			expect(await crowdsalev2.getBuyin(signers[0].address)).to.eq(
				ethers.utils.parseEther('1')
			);
		});

		it('should revert after buy-in phase', async () => {
			await ethers.provider.send('evm_increaseTime', [3 * 24 * 60 * 60 + 1]);
			await ethers.provider.send('evm_mine', []);

			await expect(
				crowdsalev2.buy({ value: ethers.utils.parseEther('1') })
			).to.be.revertedWith(generateErrorMsg('Buy-in phase is over!'));
		});
	});

	describe('collectEth', async () => {
		it('should withdraw ether', async () => {
			await crowdsalev2.buy({ value: ethers.utils.parseEther('1') });

			await ethers.provider.send('evm_increaseTime', [3 * 24 * 60 * 60 + 1]);
			await ethers.provider.send('evm_mine', []);

			await expect(() => crowdsalev2.collectEth()).to.changeEtherBalance(
				signers[0],
				ethers.utils.parseEther('1')
			);

			expect(await ethers.provider.getBalance(crowdsalev2.address)).to.eq(
				ethers.utils.parseEther('0')
			);
		});

		it('should revert during buy-in phase', async () => {
			await crowdsalev2.buy({ value: ethers.utils.parseEther('1') });

			await expect(crowdsalev2.collectEth()).to.be.revertedWith(
				generateErrorMsg('Buy-in phase is not finished!')
			);
		});

		it('should revert if not owner of contract', async () => {
			crowdsalev2 = await crowdsalev2.connect(signers[1]);

			await expect(crowdsalev2.collectEth()).to.be.revertedWith(
				generateErrorMsg('Ownable: caller is not the owner')
			);
		});
	});

	describe('withdraw', async () => {
		it('should withdraw tokens and distribute them evenly', async () => {
			await crowdsalev2.buy({ value: ethers.utils.parseEther('2') });

			let crowdsalev21 = await crowdsalev2.connect(signers[1]);
			await crowdsalev21.buy({ value: ethers.utils.parseEther('6') });

			await ethers.provider.send('evm_increaseTime', [3 * 24 * 60 * 60 + 1]);
			await ethers.provider.send('evm_mine', []);

			await crowdsalev2.withdraw();
			expect(await erc20mintable.balanceOf(signers[0].address)).to.eq(
				ethers.utils.parseEther('1')
			);

			await crowdsalev21.withdraw();
			expect(await erc20mintable.balanceOf(signers[1].address)).to.eq(
				ethers.utils.parseEther('3')
			);
		});

		it('should revert on second withdraw attempt', async () => {
			await crowdsalev2.buy({ value: ethers.utils.parseEther('1') });

			await ethers.provider.send('evm_increaseTime', [3 * 24 * 60 * 60 + 1]);
			await ethers.provider.send('evm_mine', []);

			await crowdsalev2.withdraw();
			await expect(crowdsalev2.withdraw()).to.be.revertedWith(
				generateErrorMsg('You have already withdrew your tokens!')
			);
		});

		it('should revert during buy-in phase', async () => {
			await crowdsalev2.buy({ value: ethers.utils.parseEther('1') });

			await expect(crowdsalev2.withdraw()).to.be.revertedWith(
				generateErrorMsg('Buy-in phase is not finished!')
			);
		});
	});
});
