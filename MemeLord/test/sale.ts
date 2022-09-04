import { ethers } from 'hardhat';
import chai from 'chai';
import { solidity } from 'ethereum-waffle';
import { MemeLord } from '../typechain/MemeLord';
import { Sale } from '../typechain/Sale';

chai.use(solidity);
const { expect } = chai;

function generateErrorMsg(error: any) {
	return `VM Exception while processing transaction: reverted with reason string '${error}'`;
}

describe('Sale', () => {
	let sale: Sale;
	let memelord: MemeLord;
	let signers: any[];

	beforeEach(async () => {
		signers = await ethers.getSigners();

		const memelordFactory = await ethers.getContractFactory(
			'MemeLord',
			signers[0]
		);
		memelord = (await memelordFactory.deploy()) as MemeLord;
		await memelord.deployed();

		expect(memelord.address).to.properAddress;

		const saleFactory = await ethers.getContractFactory('Sale', signers[0]);
		sale = (await saleFactory.deploy(memelord.address)) as Sale;
		await sale.deployed();

		expect(sale.address).to.properAddress;

		await memelord.mintToAddr(sale.address);
	});

	describe('bidding features', async () => {
		it('should place a bid', async () => {
			await sale.bid(0, ethers.utils.parseEther('0.1'));
			expect(await sale.getHighestBid(0)).to.eq(ethers.utils.parseEther('0.1'));
		});

		it('should revert after bidding phase', async () => {
			await ethers.provider.send('evm_increaseTime', [10 * 24 * 60 * 60 + 1]);
			await ethers.provider.send('evm_mine', []);

			await expect(
				sale.bid(0, ethers.utils.parseEther('0.1'))
			).to.be.revertedWith(generateErrorMsg('Bidding is closed!'));
		});

		it('should revert if bid is lower then highest bid', async () => {
			await sale.bid(0, ethers.utils.parseEther('0.1'));
			await expect(
				sale.bid(0, ethers.utils.parseEther('0.05'))
			).to.be.revertedWith(generateErrorMsg('Bid is too low!'));
		});
	});

	describe('withdrawNFT', async () => {
		it('should withdraw a NFT as highest bidder', async () => {
			await sale.bid(0, ethers.utils.parseEther('0.1'));

			await ethers.provider.send('evm_increaseTime', [10 * 24 * 60 * 60 + 1]);
			await ethers.provider.send('evm_mine', []);

			await sale.withdrawNFT(0, { value: ethers.utils.parseEther('0.1') });

			expect(await memelord.ownerOf(0)).to.eq(signers[0].address);
		});

		it('should withdraw NFT on lowered price after an hour', async () => {
			await sale.bid(0, ethers.utils.parseEther('0.1'));

			await ethers.provider.send('evm_increaseTime', [
				10 * 24 * 60 * 60 + 3601,
			]);
			await ethers.provider.send('evm_mine', []);

			await sale.withdrawNFT(0, { value: ethers.utils.parseEther('0.09') });

			expect(await memelord.ownerOf(0)).to.eq(signers[0].address);
		});

		it('should revert on withdrawing the already withdrawn NFT', async () => {
			await sale.bid(0, ethers.utils.parseEther('0.1'));

			await ethers.provider.send('evm_increaseTime', [10 * 24 * 60 * 60 + 1]);
			await ethers.provider.send('evm_mine', []);

			await sale.withdrawNFT(0, { value: ethers.utils.parseEther('0.1') });

			await expect(
				sale.withdrawNFT(0, { value: ethers.utils.parseEther('0.1') })
			).to.be.revertedWith(generateErrorMsg('Meme is not on sale anymore!'));
		});

		it('should revert on withdrawing NFT if caller is not the highest bidder', async () => {
			await sale.bid(0, ethers.utils.parseEther('0.1'));

			await ethers.provider.send('evm_increaseTime', [10 * 24 * 60 * 60 + 1]);
			await ethers.provider.send('evm_mine', []);

			sale = sale.connect(signers[1]);

			await expect(
				sale.withdrawNFT(0, { value: ethers.utils.parseEther('0.1') })
			).to.be.revertedWith(
				generateErrorMsg("The highest bidder didn't withdraw NFT yet!")
			);
		});

		it('should revert on withdrawing NFT with insufficient funds', async () => {
			await sale.bid(0, ethers.utils.parseEther('0.1'));

			await ethers.provider.send('evm_increaseTime', [10 * 24 * 60 * 60 + 1]);
			await ethers.provider.send('evm_mine', []);

			await expect(
				sale.withdrawNFT(0, { value: ethers.utils.parseEther('0.05') })
			).to.be.revertedWith(
				generateErrorMsg('You did not pay the correct amount!')
			);
		});

		it('should revert on withdrawing NFT if bidding phase is not over', async () => {
			await sale.bid(0, ethers.utils.parseEther('0.1'));

			await expect(
				sale.withdrawNFT(0, { value: ethers.utils.parseEther('0.1') })
			).to.be.revertedWith(generateErrorMsg('Bidding is still open!'));
		});
	});
});
