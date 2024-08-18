import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { Campaign, CampaignFactory } from "../typechain-types";

type NewCampaignFactory = CampaignFactory & { target?: string };
type NewCampaign = Campaign & { target?: string };

describe("Campaign Factory", async () => {
  async function deployContractFixture() {
    // Contracts are deployed using the first signer/account by default
    // @ts-expect-error
    const [owner, otherAccount] = await ethers.getSigners();
    const manager = owner;

    // deploy campaign factory
    const contractFactory: NewCampaignFactory = await ethers.deployContract(
      "CampaignFactory"
    );
    const campaignFactoryAddress = contractFactory?.target;

    // create campaign
    const createCampaign = await contractFactory.createCampaign("100");

    // deploy campaign
    const argsCampaign = ["100", manager];
    const contractCampaign: NewCampaign = await ethers.deployContract(
      "Campaign",
      argsCampaign
    );
    const campaignAddress = contractCampaign?.target;

    return {
      manager,
      otherAccount,
      contractFactory,
      campaignFactoryAddress,
      createCampaign,
      contractCampaign,
      campaignAddress,
    };
  }

  it("campaign address and owner must be the same", async () => {
    const { manager, campaignFactoryAddress, createCampaign } =
      await loadFixture(deployContractFixture);

    // contract address must be the same
    expect(campaignFactoryAddress).to.equal(createCampaign.to);

    // owner address must be the same
    expect(manager.address).to.equal(createCampaign.from);
  });

  it("allows people to contribute money and marks them as approvers", async () => {
    const { otherAccount, contractCampaign } = await loadFixture(
      deployContractFixture
    );

    await contractCampaign.connect(otherAccount).contribute({ value: "200" });
    const isContributor = contractCampaign.connect(otherAccount).approvers;

    expect(isContributor).not.to.be.null;
  });

  it("require a minimum contribution", async () => {
    const { otherAccount, contractCampaign } = await loadFixture(
      deployContractFixture
    );

    try {
      await contractCampaign.connect(otherAccount).contribute({ value: "5" });
    } catch (error: any) {
      expect(error).to.be.revertedWith(
        "Transaction reverted without a reason string"
      );
    }
  });

  it("allows a manager to make a payment request", async () => {
    const { manager, otherAccount, contractCampaign } = await loadFixture(
      deployContractFixture
    );

    await contractCampaign
      .connect(manager)
      .createRequest("Buy a coffee", "100", otherAccount);

    const request = contractCampaign.requests;

    console.log(request);
  });
});
