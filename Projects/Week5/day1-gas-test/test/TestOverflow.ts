import { ethers } from "hardhat";
import { expect } from "chai";
import { OverflowTest } from "../typechain-types";

const SAFE_INCREMENT = 99n;
const UNSAFE_INCREMENT = 199n;

if (SAFE_INCREMENT + UNSAFE_INCREMENT <= 2 ** 8)
  throw new Error("Test not properly configured");

describe("Testing Overflow operations", async () => {
  let testContract: OverflowTest;

  beforeEach(async () => {
    const testContractFactory = await ethers.getContractFactory("OverflowTest");
    testContract = await testContractFactory.deploy();
    await testContract.waitForDeployment();
    const tx = await testContract.increment(SAFE_INCREMENT);
    await tx.wait();
  });

  describe("When incrementing under safe circumstances", async () => {
    it("increments correctly", async () => {
      const initialNumber = await testContract.counter();
      const tx = await testContract.increment(SAFE_INCREMENT);
      await tx.wait();
      const result = await testContract.counter();
      expect(result).to.equal(initialNumber + SAFE_INCREMENT);
    });
  });
  describe("When incrementing to overflow", async () => {
    it("reverts", async () => {
      const tx = testContract.increment(UNSAFE_INCREMENT);
      await expect(tx).to.be.reverted;
    });
  });
  describe("When incrementing to overflow within a unchecked block", async () => {
    it("overflows and increments", async () => {
      const initialNumber = await testContract.counter();
      const tx = await testContract.forceIncrement(UNSAFE_INCREMENT);
      await tx.wait();
      const result = await testContract.counter();
      expect(result).to.equal(initialNumber + UNSAFE_INCREMENT - 256n);
    });
  });
});
