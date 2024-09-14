import { expect } from "chai";
import { viem } from "hardhat";
import { parseEther } from "viem";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";

const MINTER_ROLE =
  "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6";

const TEST_RATIO = 100n;
const TEST_PRICE = 10n;
const TEST_PURCHASE_SIZE = parseEther("1");

async function deployContractFixture() {
  const publicClient = await viem.getPublicClient();
  const [owner, otherAccount] = await viem.getWalletClients();
  const myTokenContract = await viem.deployContract("MyToken");
  const nftContract = await viem.deployContract("MyNFT");
  const tokenSaleContract = await viem.deployContract("TokenSale", [
    TEST_RATIO,
    TEST_PRICE,
    myTokenContract.address,
    nftContract.address,
  ]);
  const giveMinterRoleTokenTx = await myTokenContract.write.grantRole([
    MINTER_ROLE,
    tokenSaleContract.address,
  ]);
  await publicClient.waitForTransactionReceipt({ hash: giveMinterRoleTokenTx });
  return {
    publicClient,
    owner,
    otherAccount,
    tokenSaleContract,
    myTokenContract,
    nftContract,
  };
}

describe("NFT Shop", async () => {
  describe("When the Shop contract is deployed", async () => {
    it("defines the ratio as provided in parameters", async () => {
      const { tokenSaleContract } = await loadFixture(deployContractFixture);
      const ratio = await tokenSaleContract.read.ratio();
      expect(ratio).to.equal(TEST_RATIO);
    });
    it("defines the price as provided in parameters", async () => {
      const { tokenSaleContract } = await loadFixture(deployContractFixture);
      const price = await tokenSaleContract.read.price();
      expect(price).to.equal(TEST_PRICE);
    });
    it("uses a valid ERC20 as payment token", async () => {
      const { tokenSaleContract } = await loadFixture(deployContractFixture);
      const paymentTokenAddress = await tokenSaleContract.read.paymentToken();
      const paymentTokenContract = await viem.getContractAt(
        "MyToken",
        paymentTokenAddress
      );
      const [totalSupply, name, symbol, decimals] = await Promise.all([
        paymentTokenContract.read.totalSupply(),
        paymentTokenContract.read.name(),
        paymentTokenContract.read.symbol(),
        paymentTokenContract.read.decimals(),
      ]);
      expect(totalSupply).to.eq(10000000000000000000n);
      expect(name).to.eq("MyToken");
      expect(symbol).to.eq("MTK");
      expect(decimals).to.eq(18);
    });
    it("uses a valid ERC721 as NFT collection", async () => {
      throw new Error("Not implemented");
    });
  });
  describe("When a user buys an ERC20 from the Token contract", async () => {
    it("charges the correct amount of ETH", async () => {
      throw new Error("Not implemented");
    });
    it("gives the correct amount of tokens", async () => {
      const { publicClient, tokenSaleContract, myTokenContract, otherAccount } =
        await loadFixture(deployContractFixture);
      const tokenBalanceBefore = await tokenSaleContract.read.balanceOf([
        otherAccount.account.address,
      ]);
      const buyTokensTx = await tokenSaleContract.write.buyTokens({
        value: TEST_PURCHASE_SIZE,
        account: otherAccount.account,
      });
      const receipt = await publicClient.getTransactionReceipt({
        hash: buyTokensTx,
      });
      if (!receipt.status || receipt.status !== "success")
        throw new Error("Transaction failed");
      const tokenBalanceAfter = await tokenSaleContract.read.balanceOf([
        otherAccount.account.address,
      ]); // TODO
      const diff = tokenBalanceAfter - tokenBalanceBefore;
      expect(diff).to.equal(TEST_PURCHASE_SIZE * TEST_RATIO);
    });
  });
  describe("When a user burns an ERC20 at the Shop contract", async () => {
    it("gives the correct amount of ETH", async () => {
      throw new Error("Not implemented");
    });
    it("burns the correct amount of tokens", async () => {
      const { publicClient, tokenSaleContract, myTokenContract, otherAccount } =
        await loadFixture(deployContractFixture);

      const buyTokensTx = await tokenSaleContract.buyTokens();
    });
  });
  describe("When a user buys an NFT from the Shop contract", async () => {
    it("charges the correct amount of ERC20 tokens", async () => {
      throw new Error("Not implemented");
    });
    it("gives the correct NFT", async () => {
      throw new Error("Not implemented");
    });
  });
  describe("When a user burns their NFT at the Shop contract", async () => {
    it("gives the correct amount of ERC20 tokens", async () => {
      throw new Error("Not implemented");
    });
  });
  describe("When the owner withdraws from the Shop contract", async () => {
    it("recovers the right amount of ERC20 tokens", async () => {
      throw new Error("Not implemented");
    });
    it("updates the owner pool account correctly", async () => {
      throw new Error("Not implemented");
    });
  });
});
