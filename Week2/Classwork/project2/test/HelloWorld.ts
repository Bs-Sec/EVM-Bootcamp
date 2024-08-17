import { viem } from "hardhat";
import { expect } from "chai";
// import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";

describe("Hello World", () => {
  it("should give a hello wordl", async () => {
    const publicClient = await viem.getPublicClient();
    const lastBlock = await publicClient.getBlock();
    console.log({ lastBlock });
    const arrayWallets = await viem.getWalletClients();
    const [a, b, c] = arrayWallets;
    const helloWorldText = "TODO";
    expect(helloWorldText).to.equal("Hello World");
  });
});
