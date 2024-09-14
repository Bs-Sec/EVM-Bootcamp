import { viem } from "hardhat";
import { recoverMessageAddress, hexToSignature } from "viem";
import * as readline from "readline";
import { mine } from "@nomicfoundation/hardhat-network-helpers";

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question(
    "Select operation: \n Options: \n [1]: Random from block hash \n [2]: Toss a coin \n [3]: Message signature \n [4]: Random from a sealed seed \n [5]: Random from block hash plus a sealed seed \n [6]: Random from randao \n",
    (answer) => {
      console.log(`Selected: ${answer}`);
      const option = Number(answer);
      switch (option) {
        case 1:
          blockHashRandomness();
          break;
        case 2:
          tossCoin();
          break;
        case 3:
          signature();
          break;
        case 4:
          sealedSeed();
          break;
        case 5:
          randomSealedSeed();
          break;
        case 6:
          randao();
          break;
        default:
          console.log("Invalid");
          break;
      }
      rl.close();
    }
  );
}

async function blockHashRandomness() {
  const publicClient = await viem.getPublicClient();
  const currentBlock = await publicClient.getBlock();
  const contract = await viem.deployContract("NotQuiteRandom");
  const randomNumber = await contract.read.getRandomNumber();
  console.log(
    `Block number: ${currentBlock?.number}\nBlock hash: ${currentBlock?.hash}\nRandom number from this block hash: ${randomNumber}`
  );
  await mine(1);
  const currentBlock2 = await publicClient.getBlock();
  const randomNumber2 = await contract.read.getRandomNumber();
  console.log(
    `Block number: ${currentBlock2?.number}\nBlock hash: ${currentBlock2?.hash}\nRandom number from this block hash: ${randomNumber2}`
  );
  await mine(1);
  const currentBlock3 = await publicClient.getBlock();
  const randomNumber3 = await contract.read.getRandomNumber();
  console.log(
    `Block number: ${currentBlock3?.number}\nBlock hash: ${currentBlock3?.hash}\nRandom number from this block hash: ${randomNumber3}`
  );
  await mine(1);
  const currentBlock4 = await publicClient.getBlock();
  const randomNumber4 = await contract.read.getRandomNumber();
  console.log(
    `Block number: ${currentBlock4?.number}\nBlock hash: ${currentBlock4?.hash}\nRandom number from this block hash: ${randomNumber4}`
  );
  await mine(1);
  const currentBlock5 = await publicClient.getBlock();
  const randomNumber5 = await contract.read.getRandomNumber();
  console.log(
    `Block number: ${currentBlock5?.number}\nBlock hash: ${currentBlock5?.hash}\nRandom number from this block hash: ${randomNumber5}`
  );
}

async function tossCoin() {
  const publicClient = await viem.getPublicClient();
  const currentBlock = await publicClient.getBlock();
  const contract = await viem.deployContract("NotQuiteRandom");
  const heads = await contract.read.tossCoin();
  console.log(
    `Block number: ${currentBlock?.number}\nBlock hash: ${
      currentBlock?.hash
    }\nThe coin landed as: ${heads ? "Heads" : "Tails"}`
  );
  await mine(1);
  const currentBlock2 = await publicClient.getBlock();
  const heads2 = await contract.read.tossCoin();
  console.log(
    `Block number: ${currentBlock2?.number}\nBlock hash: ${
      currentBlock2?.hash
    }\nThe coin landed as: ${heads2 ? "Heads" : "Tails"}`
  );
  await mine(1);
  const currentBlock3 = await publicClient.getBlock();
  const heads3 = await contract.read.tossCoin();
  console.log(
    `Block number: ${currentBlock3?.number}\nBlock hash: ${
      currentBlock3?.hash
    }\nThe coin landed as: ${heads3 ? "Heads" : "Tails"}`
  );
  await mine(1);
  const currentBlock4 = await publicClient.getBlock();
  const heads4 = await contract.read.tossCoin();
  console.log(
    `Block number: ${currentBlock4?.number}\nBlock hash: ${
      currentBlock4?.hash
    }\nThe coin landed as: ${heads4 ? "Heads" : "Tails"}`
  );
  await mine(1);
  const currentBlock5 = await publicClient.getBlock();
  const heads5 = await contract.read.tossCoin();
  console.log(
    `Block number: ${currentBlock5?.number}\nBlock hash: ${
      currentBlock5?.hash
    }\nThe coin landed as: ${heads5 ? "Heads" : "Tails"}`
  );
}
async function signature() {
  const signers = await viem.getWalletClients();
  const signer = signers[0];
  console.log(
    `Signing a message with the account of address ${signer.account.address}`
  );
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question("Enter a message to be signed:\n", async (answer) => {
    const signedMessage = await signer.signMessage({ message: answer });
    console.log(`The signed message is:\n${signedMessage}`);
    rl.close();
    testSignature();
  });
}

async function testSignature() {
  console.log("Verifying signature\n");
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question("Enter message signature:\n", (userSignature) => {
    rl.question("Enter message:\n", async (message) => {
      const signature = userSignature as `0x${string}` | Uint8Array;
      const address = await recoverMessageAddress({ message, signature });
      console.log(`This message signature matches with address ${address}`);
      rl.question("Repeat? [Y/N]:\n", (answer) => {
        rl.close();
        if (answer.toLowerCase() === "y") {
          testSignature();
        }
      });
    });
  });
}

async function sealedSeed() {
  console.log("Deploying contract");
  const contract = await viem.deployContract("PseudoRandom");
  const signers = await viem.getWalletClients();
  const signer = signers[0];
  console.log(
    `Signing a message with the account of address ${signer.account.address}`
  );
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question("Enter a random seed to be signed:\n", async (seed) => {
    const signedMessage = await signer.signMessage({ message: seed });
    rl.close();
    console.log(`The signed message is:\n${signedMessage}`);
    const sig = hexToSignature(signedMessage);
    console.log("Saving signature at contract");
    const sigV = sig.v ? Number(sig.v) : 0;
    await contract.write.setSignature([sigV, sig.r, sig.s]);
    try {
      console.log("Trying to get a number with the original seed");
      const randomNumber = await contract.read.getRandomNumber([seed]);
      console.log(`Random number result:\n${randomNumber}`);
      console.log("Trying to get a number without the original seed");
      const fakeSeed = "FAKE_SEED";
      const randomNumber2 = await contract.read.getRandomNumber([fakeSeed]);
      console.log(`Random number result:\n${randomNumber2}`);
    } catch (error) {
      console.log("Operation failed");
    }
  });
}

async function randomSealedSeed() {
  console.log("Deploying contract");
  const contract = await viem.deployContract("PseudoRandom");
  const signers = await viem.getWalletClients();
  const signer = signers[0];
  console.log(
    `Signing a message with the account of address ${signer.account.address}`
  );
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question("Enter a random seed to be signed:\n", async (seed) => {
    const signedMessage = await signer.signMessage({ message: seed });
    rl.close();
    console.log(`The signed message is:\n${signedMessage}`);
    const sig = hexToSignature(signedMessage);
    console.log("Saving signature at contract");
    const sigV = sig.v ? Number(sig.v) : 0;
    await contract.write.setSignature([sigV, sig.r, sig.s]);
    try {
      console.log("Trying to get a number with the original seed");
      const randomNumber = await contract.read.getCombinedRandomNumber([seed]);
      console.log(`Random number result:\n${randomNumber}`);
      console.log("Trying to get a number without the original seed");
      const fakeSeed = "FAKE_SEED";
      const randomNumber2 = await contract.read.getCombinedRandomNumber([
        fakeSeed,
      ]);
      console.log(`Random number result:\n${randomNumber2}`);
    } catch (error) {
      console.log("Operation failed");
    }
  });
}

async function randao() {
  const publicClient = await viem.getPublicClient();
  console.log("Deploying contract");
  const contract = await viem.deployContract("Random");
  const currentBlock = await publicClient.getBlock();
  const randomNumber = await contract.read.getRandomNumber();
  console.log(
    `Block number: ${currentBlock?.number}\nBlock difficulty: ${currentBlock?.difficulty}\nRandom number from this block difficulty: ${randomNumber}`
  );
  await mine(1);
  const currentBlock2 = await publicClient.getBlock();
  const randomNumber2 = await contract.read.getRandomNumber();
  console.log(
    `Block number: ${currentBlock2?.number}\nBlock difficulty: ${currentBlock2?.difficulty}\nRandom number from this block difficulty: ${randomNumber2}`
  );
  await mine(1);
  const currentBlock3 = await publicClient.getBlock();
  const randomNumber3 = await contract.read.getRandomNumber();
  console.log(
    `Block number: ${currentBlock3?.number}\nBlock difficulty: ${currentBlock3?.difficulty}\nRandom number from this block difficulty: ${randomNumber3}`
  );
  await mine(1);
  const currentBlock4 = await publicClient.getBlock();
  const randomNumber4 = await contract.read.getRandomNumber();
  console.log(
    `Block number: ${currentBlock4?.number}\nBlock difficulty: ${currentBlock4?.difficulty}\nRandom number from this block difficulty: ${randomNumber4}`
  );
  await mine(1);
  const currentBlock5 = await publicClient.getBlock();
  const randomNumber5 = await contract.read.getRandomNumber();
  console.log(
    `Block number: ${currentBlock5?.number}\nBlock difficulty: ${currentBlock5?.difficulty}\nRandom number from this block difficulty: ${randomNumber5}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
