import {
  createPublicClient,
  http,
  createWalletClient,
  formatEther,
  toHex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import * as dotenv from "dotenv";
import { abi, bytecode } from "../artifacts/contracts/Ballot.sol/Ballot.json";

dotenv.config();

const providerApiKey = process.env.ALCHEMY_API_KEY || "";
const deployerPrivateKey = process.env.PRIVATE_KEY || "";

async function main() {
  const proposals = process.argv.slice(2);
  if (!proposals || proposals.length < 1)
    throw new Error("Proposals not provided");
  console.log("Proposals: ");
  proposals.forEach((proposal) => {
    console.log(`\(${proposals.indexOf(proposal) + 1}\) ${proposal}`);
  });

  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),
  });
  const blockNumber = await publicClient.getBlockNumber();
  console.log("Last block number:", blockNumber);

  const account = privateKeyToAccount(`0x${deployerPrivateKey}`);
  const deployer = createWalletClient({
    account,
    chain: sepolia,
    transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),
  });
  console.log("Deployer address:", deployer.account.address);

  const balance = await publicClient.getBalance({
    address: deployer.account.address,
  });
  console.log(
    "Deployer balance:",
    formatEther(balance),
    deployer.chain.nativeCurrency.symbol
  );

  console.log("Deploying Contract.");
  const hash = await deployer.deployContract({
    abi,
    bytecode: bytecode as `0x${string}`,
    // Ask question about why you should encode the proposals into hex and set it to size 32
    args: [proposals.map((proposal) => toHex(proposal, { size: 32 }))],
  });
  console.log("Transaction hash:", hash);
  console.log("Confirmation Pending");
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log("Contract Address on Sepolia:", receipt.contractAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
