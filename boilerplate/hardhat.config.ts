import { HardhatUserConfig } from "hardhat/config";

import "@typechain/hardhat"
import "@nomiclabs/hardhat-ethers"
import "@nomiclabs/hardhat-waffle"
import "hardhat-gas-reporter"

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  solidity: {
    compilers: [
      { 
        version: "0.7.3", 
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        } 
      },
      { 
        version: "0.8.9", 
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        } 
      }
    ],
  },
  typechain: {
    outDir: 'typechain',
    target: 'ethers-v5',
  }
};

export default config;
