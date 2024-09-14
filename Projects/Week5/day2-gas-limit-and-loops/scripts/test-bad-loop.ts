import generate from "random-words";
import { viem } from "hardhat";
import { toHex, hexToString, formatEther } from "viem";

const HARDCODED_SAFE_LOOP_LIMIT = 1000;
const BLOCK_GAS_LIMIT = 30000000n;

async function main() {
  const publicClient = await viem.getPublicClient();

  const wordDatabase = generate({
    exactly: HARDCODED_SAFE_LOOP_LIMIT * 100,
  }) as string[];

  let wordCount = 10;

  try {
    for (let loop = 0; loop < HARDCODED_SAFE_LOOP_LIMIT; loop++) {
      console.log(`Loop ${loop}: Testing with ${wordCount} words`);
      const proposals = wordDatabase.slice(0, wordCount);
      const ballotContract = await viem.deployContract("SortedBallot", [
        proposals.map((prop) => toHex(prop, { size: 32 })),
      ]);
      console.log(`Passed ${wordCount} proposals:`);
      console.log(proposals.join(", "));
      console.log("Sorting proposals now...");
      const sortTx = await ballotContract.write.sortProposals();
      console.log("Awaiting confirmations");
      const sortReceipt = await publicClient.getTransactionReceipt({
        hash: sortTx,
      });
      console.log("Completed");
      const gasUsed = sortReceipt?.gasUsed ?? 0n;
      const gasPrice = sortReceipt?.effectiveGasPrice ?? 0n;
      const txFee = gasUsed * gasPrice;
      const percentUsed = Number((gasUsed * 10000n) / BLOCK_GAS_LIMIT) / 100;
      console.log(
        `${gasUsed} units of gas used at ${formatEther(
          gasPrice,
          "gwei"
        )} GWEI effective gas price, total of ${formatEther(
          txFee
        )} ETH spent. This used ${percentUsed} % of the block gas limit`
      );
      const props = [];
      for (let index = 0n; index < wordCount; index++) {
        const prop = await ballotContract.read.proposals([index]);
        props.push(hexToString(prop[0]));
      }
      console.log("Sorted proposals: ");
      console.log(props.join(", "));
      wordCount +=
        percentUsed > 95
          ? 1
          : percentUsed > 90
          ? 2
          : percentUsed > 75
          ? 10
          : 20;
    }
  } catch (error) {
    console.log(
      `Congratulations! You broke the block limit while sorting ${wordCount} words in a Smart Contract`
    );
    console.log({ error });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
