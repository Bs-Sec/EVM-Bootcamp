import generate from "random-words";
import { viem } from "hardhat";
import { toHex, hexToString, formatEther } from "viem";

const BLOCK_GAS_LIMIT = 30000000n;
const WORD_COUNT = 300;
const STEP_SIZE = 5000n;

async function main() {
  const publicClient = await viem.getPublicClient();
  const proposals = generate({ exactly: WORD_COUNT }) as string[];
  const ballotContract = await viem.deployContract("CorrectSortedBallot", [
    proposals.map((prop) => toHex(prop, { size: 32 })),
  ]);
  let completed = false;
  let loop = 0;
  let totalGas = 0n;
  let totalFees = 0n;
  while (!completed) {
    console.log("Sorting proposals");
    console.log(`Currently at the loop number ${++loop}`);
    console.log("Sorting proposals now...");
    const sortTx = await ballotContract.write.sortProposals([STEP_SIZE]);
    console.log("Awaiting confirmations");
    const sortReceipt = await publicClient.getTransactionReceipt({
      hash: sortTx,
    });
    console.log("Operation completed");
    const gasUsed = sortReceipt?.gasUsed ?? 0n;
    totalGas += gasUsed;
    const gasPrice = sortReceipt?.effectiveGasPrice ?? 0n;
    const txFee = gasUsed * gasPrice;
    totalFees += txFee;
    const percentUsed = Number((gasUsed * 10000n) / BLOCK_GAS_LIMIT) / 100;
    console.log(
      `${gasUsed} units of gas used at ${formatEther(
        gasPrice,
        "gwei"
      )} GWEI effective gas price, total of ${formatEther(
        txFee
      )} ETH spent. This used ${percentUsed} % of the block gas limit`
    );
    if (loop > 1) {
      console.log(
        `Sum of ${totalGas} units of gas used so far in the ${loop} loops (${
          1n + totalGas / BLOCK_GAS_LIMIT
        } blocks), totalling an amount of ${formatEther(totalFees)} ETH spent `
      );
    }
    const [sortedWords, savedIndex, swaps] = await Promise.all([
      ballotContract.read.sortedWords(),
      ballotContract.read.savedIndex(),
      ballotContract.read.swaps(),
    ]);
    console.log(
      `So far it has sorted ${sortedWords} words. Currently at position ${savedIndex}, where the current loop found ${swaps} words out of place `
    );
    completed = await ballotContract.read.sortedWords();
    console.log(
      `The sorting process has${completed ? " " : " not "}been completed`
    );
    if (completed) {
      const props = [];
      for (let index = 0n; sortedWords > index; index++) {
        const prop = await ballotContract.read.proposals([index]);
        props.push(hexToString(prop[0]));
      }
      console.log(`Passed ${WORD_COUNT} proposals:`);
      console.log(proposals.join(", "));
      console.log(`Sorted ${sortedWords} proposals: `);
      console.log(props.join(", "));
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
