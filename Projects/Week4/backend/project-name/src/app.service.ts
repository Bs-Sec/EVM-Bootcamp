import { Injectable } from '@nestjs/common';
import * as tokenJson from './assets/MyToken.json';
import {
  Address,
  createPublicClient,
  createWalletClient,
  getContract,
  formatEther,
  http,
  keccak256,
  isAddress,
  stringToBytes,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';

@Injectable()
export class AppService {
  publicClient: any;
  walletClient: any;
  contract: any;

  constructor() {
    this.publicClient = createPublicClient({
      chain: sepolia,
      transport: http(process.env.RPC_ENDPOINT_URL),
    });

    const account = privateKeyToAccount(`0x${process.env.PRIVATE_KEY}`);

    this.walletClient = createWalletClient({
      account,
      chain: sepolia,
      transport: http(process.env.RPC_ENDPOINT_URL),
    });

    this.contract = getContract({
      address: process.env.TOKEN_ADDRESS as Address,
      abi: tokenJson.abi,
      client: {
        public: this.publicClient as never,
        wallet: this.walletClient as never,
      },
    });
  }

  getContractAddress() {
    return process.env.TOKEN_ADDRESS as Address;
  }

  async getTokenName() {
    const name = await this.contract.read.name();
    return name as string;
  }

  async getTotalSupply() {
    const totalSupply = await this.contract.read.totalSupply();
    const totalSupplyFormatted = formatEther(totalSupply);
    return totalSupplyFormatted;
  }

  async getTokenBalance(address: string) {
    if (isAddress(address)) {
      const addressBalance = await this.contract.read.balanceOf([address]);
      const addressBalanceFormatted = formatEther(addressBalance);
      return addressBalanceFormatted;
    } else {
      return 'You have not provided a valid address';
    }
  }

  async getTransactionReceipt(hash: string) {
    if (/^0x[a-zA-Z0-9]{64}/.test(hash)) {
      const formattedHash = hash.slice(2);
      console.log(formattedHash);
      const transactionReceipt = await this.publicClient.getTransactionReceipt({
        hash: `0x${formattedHash}`,
      });
      return transactionReceipt;
    } else {
      return 'Invalid transaction receipt';
    }
  }

  getServerWalletAddress(): string {
    return this.walletClient.account.address;
  }

  async checkMinterRole(address: string) {
    if (isAddress(address)) {
      const hashedRole = keccak256(stringToBytes('MINTER_ROLE'));
      const isMinter = await this.contract.read.hasRole([
        hashedRole,
        address as Address,
      ]);
      if (isMinter) {
        return 'You have the minter role';
      } else {
        return 'You do not have the minter role';
      }
    } else {
      return 'You did not provide a valid address';
    }
  }

  async mintTokens(address: string, amount: number) {
    if (isAddress(address)) {
      const hash = await this.contract.write.mint([address, amount]);
      const receipt = await this.publicClient.waitForTransactionReceipt({
        hash,
      });
      return {
        answer: true,
        receipt: receipt.transactionHash,
      };
    } else {
      return 'You did not provided a valid address';
    }
  }
}
