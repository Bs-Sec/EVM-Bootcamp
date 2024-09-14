import { viem } from "hardhat";

const STRING_A = "Pen";
const STRING_B = "Apple";
const STRING_C = "Pineapple";

async function main() {
  const publicClient = await viem.getPublicClient();
  console.log("\n", "Deploying StringUtilsTest contract...");
  const contract = await viem.deployContract("StringUtilsTest");
  console.log("\n", "Contract deployed to:", contract.address);

  console.log("\n", "Testing concat with Library");
  const libraryConcatTx = await contract.write.concatenateAndSaveUsingLibrary([
    STRING_B,
    STRING_A,
  ]);
  const libraryConcatTxReceipt = await publicClient.getTransactionReceipt({
    hash: libraryConcatTx,
  });
  console.log(
    "\n",
    `Doing a concat of ${STRING_B} and ${STRING_A} using the Library costs ${libraryConcatTxReceipt.gasUsed} gas units`
  );

  console.log("\n", "Testing concat with ABI");
  const abiConcatTx = await contract.write.concatenateAndSaveUsingAbiEncode([
    STRING_B,
    STRING_A,
  ]);
  const abiConcatTxReceipt = await publicClient.getTransactionReceipt({
    hash: abiConcatTx,
  });
  console.log(
    "\n",
    `Doing a concat of ${STRING_B} and ${STRING_A} using the ABI Encode costs ${abiConcatTxReceipt.gasUsed} gas units`
  );

  console.log("\n", "Testing a false comparison with Library");
  const libraryComparisonTx =
    await contract.write.concatenateAndSaveUsingLibrary([STRING_A, STRING_C]);
  const libraryComparisonTxReceipt = await publicClient.getTransactionReceipt({
    hash: libraryComparisonTx,
  });
  console.log(
    "\n",
    `Doing a comparison of ${STRING_A} and ${STRING_C} using the Library costs ${libraryComparisonTxReceipt.gasUsed} gas units`
  );

  console.log("\n", "Testing a false comparison with ABI");
  const abiComparisonTx = await contract.write.concatenateAndSaveUsingAbiEncode(
    [STRING_A, STRING_C]
  );
  const abiComparisonTxReceipt = await publicClient.getTransactionReceipt({
    hash: abiComparisonTx,
  });
  console.log(
    "\n",
    `Doing a comparison of ${STRING_A} and ${STRING_C} using the ABI Encode costs ${abiComparisonTxReceipt.gasUsed} gas units`
  );

  const newString = `${STRING_A}${STRING_C}${STRING_B}${STRING_A}`;

  console.log("\n", "Testing a true comparison with Library");
  const libraryTrueComparisonTx =
    await contract.write.concatenateAndSaveUsingLibrary([newString, newString]);
  const libraryTrueComparisonTxReceipt =
    await publicClient.getTransactionReceipt({
      hash: libraryTrueComparisonTx,
    });
  console.log(
    "\n",
    `Doing a comparison of ${newString} and ${newString} using the Library costs ${libraryTrueComparisonTxReceipt.gasUsed} gas units`
  );

  console.log("\n", "Testing a true comparison with ABI");
  const abiTrueComparisonTx =
    await contract.write.concatenateAndSaveUsingAbiEncode([
      newString,
      newString,
    ]);
  const abiTrueComparisonTxReceipt = await publicClient.getTransactionReceipt({
    hash: abiTrueComparisonTx,
  });
  console.log(
    "\n",
    `Doing a comparison of ${newString} and ${newString} using the ABI Encode costs ${abiTrueComparisonTxReceipt.gasUsed} gas units`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
