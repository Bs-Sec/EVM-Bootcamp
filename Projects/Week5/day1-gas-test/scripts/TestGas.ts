import { ethers } from "hardhat";
import config from "../hardhat.config";
import { Gas } from "../typechain-types";

const TEST_VALUE = 100;
const TEST2_VALUE = 250;

async function compareDeploy() {
  const userSettings = config?.solidity as any;
  if (userSettings.settings?.optimizer.enabled) {
    console.log(
      `Using ${userSettings.settings?.optimizer.runs} runs optimization`
    );
  }
  const gasContractFactory = await ethers.getContractFactory("Gas");
  let contract: Gas = await gasContractFactory.deploy();
  contract = await contract.waitForDeployment();
  const deployTxReceipt = await contract.deploymentTransaction()?.wait();
  console.log(`Used ${deployTxReceipt?.gasUsed} gas units in deployment`);
  const testTx = await contract.loopActions(TEST_VALUE);
  const testTxReceipt = await testTx.wait();
  console.log(`Used ${testTxReceipt?.gasUsed} gas units in test function`);
}

// compareDeploy();

async function compareLocations() {
  const gasContractFactory = await ethers.getContractFactory("Gas");
  let contract: Gas = await gasContractFactory.deploy();
  contract = await contract.waitForDeployment();
  const testTx1 = await contract.updateNumber(TEST2_VALUE);
  const testTx1Receipt = await testTx1.wait();
  console.log(
    `Used ${testTx1Receipt?.gasUsed} gas units in storage and local reads test function`
  );
  const testTx2 = await contract.updateNumberOptimized(TEST2_VALUE);
  const testTx2Receipt = await testTx2.wait();
  console.log(
    `Used ${testTx2Receipt?.gasUsed} gas units in optimized state and local reads test function`
  );
}

// compareLocations();

async function comparePacking() {
  const gasContractFactory = await ethers.getContractFactory("Gas");
  let contract: Gas = await gasContractFactory.deploy();
  contract = await contract.waitForDeployment();
  const testTx1 = await contract.createUnpacked();
  const testTx1Receipt = await testTx1.wait();
  console.log(
    `Used ${testTx1Receipt?.gasUsed} gas units in struct packing test function`
  );
  const testTx2 = await contract.createPacked();
  const testTx2Receipt = await testTx2.wait();
  console.log(
    `Used ${testTx2Receipt?.gasUsed} gas units in optimized struct packing test function`
  );
}

// comparePacking();
