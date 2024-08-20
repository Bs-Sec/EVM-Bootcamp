import {
  createPublicClient,
  http,
  createWalletClient,
  getContract,
  fromHex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import * as dotenv from "dotenv";
import * as readline from "readline";
import { abi } from "../artifacts/contracts/Ballot.sol/Ballot.json";

dotenv.config();

const providerApiKey = process.env.ALCHEMY_API_KEY || "";
const contractAddress = process.env.CONTRACT_ADDR || "";
const privateKey = process.env.PRIVATE_KEY || "";

var checkProposal = (proposal: string, proposalItems: string[]) => {
  if (!proposalItems.includes(proposal)) {
    console.log("That is not a valid proposal name");
  } else {
    const proposalIndex = proposalItems.indexOf(proposal);
    return proposalIndex;
  }
};

const readProposals = async (pushToArray: any, contract: Function) => {
  console.log("\nProposals to vote on:");

  for (let i = 0; ; i++) {
    try {
      const proposal: any = contract;
      pushToArray.push(fromHex(proposal[0], { size: 32, to: "string" }));
      console.log(
        `\x1B[36;4m${fromHex(proposal[0], {
          size: 32,
          to: "string",
        })}\x1B[m\n`
      );
    } catch {
      break;
    }
  }
};

async function main() {
  // Wallet Instantiation
  const wallet = createWalletClient({
    account: privateKeyToAccount(`0x${privateKey}`),
    chain: sepolia,
    transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),
  });

  // API for getting information from the ethereum blockchain
  const ethscanClient = createPublicClient({
    chain: sepolia,
    transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),
  });

  // Contract to interact with
  const contract = getContract({
    address: `0x${contractAddress}`,
    abi: abi,
    client: {
      public: ethscanClient,
      wallet: wallet,
    },
  });

  let proposalArray: string[] = [];

  const checkVote = (voter: any[]) => {
    if (voter[1]) {
      console.log("You have already voted!");
      return false;
    } else if (voter[0] == 0) {
      console.log("You haven't been given the right to vote");
      return false;
    } else {
      console.log("You are able to cast a vote");
      return true;
    }
  };

  const input = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  input.question("Enter your wallet address: \n", async (address: string) => {
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      console.error("Invalid wallet address");
      input.close();
    } else {
      console.log("\nChecking if you are able to vote on a proposal...");

      let voterStruct: any = await contract.read.voters([address]);
      let answer = checkVote(voterStruct);
      if (answer == false) {
        input.close();
      } else {
        await readProposals(proposalArray, contract.read.proposals());

        input.question(
          `Please enter the proposal you'd like to vote for:\n`,
          async (proposalName: string) => {
            const output = checkProposal(
              proposalName,
              await contract.write.vote()
            );
            const txHash = await contract.write.vote([BigInt(`${output}`)]);
            const receipt = await ethscanClient.waitForTransactionReceipt({
              hash: txHash,
            });
            console.log(
              `\nStatus: \x1B[92;4m${receipt.status}\x1B[m\nTransaction Hash: ${receipt.transactionHash}`
            );
            input.close();
          }
        );
      }
    }
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
