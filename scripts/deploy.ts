import { ethers } from "hardhat";

async function main() {
  const contract = await ethers.deployContract("CampaignFactory");

  await contract.waitForDeployment();

  console.log("Contract Deployed at " + contract);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
