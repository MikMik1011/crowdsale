import { ethers } from 'hardhat';
import chai from 'chai';
import { solidity } from 'ethereum-waffle';
import { BigNumber } from 'ethers';
import { CHANGEME } from '../typechain/CHANGEME';

chai.use(solidity);
const { expect } = chai;

function generateErrorMsg(error: any) {
	return `VM Exception while processing transaction: reverted with reason string '${error}'`;
}

describe('Crowdsale', () => {
	let CHANGEME: CHANGEME;
	let signers: any[];

	beforeEach(async () => {
		signers = await ethers.getSigners();

		const CHANGEMEFactory = await ethers.getContractFactory(
			'CHANGEME',
			signers[0]
		);
		CHANGEME = (await CHANGEMEFactory.deploy(4)) as CHANGEME;
		await CHANGEME.deployed();

		expect(CHANGEME.address).to.properAddress;
	});

	
});
