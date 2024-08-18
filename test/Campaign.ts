import {loadFixture} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import {expect} from "chai";
import {ethers} from "hardhat";
import {Campaign, CampaignFactory} from "../typechain-types";
import {fromWei, toWei, UnitType} from "../utils/number";

describe("Campaign Factory", async () => {
  async function deployContractFixture() {
    // Contracts are deployed using the first signer/account by default
    // @ts-expect-error
    const [owner, otherAccount] = await ethers.getSigners();
    const manager = owner;

    // deploy campaign factory
    const contractFactory: CampaignFactory = await ethers.deployContract(
      "CampaignFactory"
    );
    const campaignFactoryAddress = contractFactory.target;

    // create campaign
    const createCampaign = await contractFactory.createCampaign("100");

    // deploy campaign
    const argsCampaign = ["100", manager];
    const contractCampaign: Campaign = await ethers.deployContract(
      "Campaign",
      argsCampaign
    );
    const campaignAddress = contractCampaign.target;

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
    const {manager, campaignFactoryAddress, createCampaign} =
      await loadFixture(deployContractFixture);

    // contract address must be the same
    expect(campaignFactoryAddress).to.equal(createCampaign.to);

    // owner address must be the same
    expect(manager.address).to.equal(createCampaign.from);
  });

  it("allows people to contribute money and marks them as approvers", async () => {
    const {otherAccount, contractCampaign} = await loadFixture(
      deployContractFixture
    );

    await contractCampaign.connect(otherAccount).contribute({value: "200"});
    const isContributor = await contractCampaign.connect(otherAccount).approvers.staticCall(otherAccount);

    expect(isContributor).to.equal(true)
  });

  it("require a minimum contribution", async () => {
    const {otherAccount, contractCampaign} = await loadFixture(
      deployContractFixture
    );

    try {
      await contractCampaign.connect(otherAccount).contribute({value: "5"});
    } catch (error: any) {
      expect(error).to.be.revertedWith(
        "Transaction reverted without a reason string"
      );
    }
  });

  it("allows a manager to make a payment request", async () => {
    const {manager, otherAccount, contractCampaign} = await loadFixture(
      deployContractFixture
    );

    await contractCampaign
      .connect(manager)
      .createRequest("Buy a coffee", "100", otherAccount);

    const request = await contractCampaign.requests.staticCall(0);

    expect("Buy a coffee").to.equal(request[0])
  });

  it('should processes request', async () => {
    const {manager, otherAccount, contractCampaign} = await loadFixture(
      deployContractFixture
    );

    const valueCampaign = toWei(10, UnitType.Ether)
    const valueCreateRequest = toWei(5, UnitType.Ether)

    // contribute
    await contractCampaign.connect(manager).contribute({value: valueCampaign.toString()});

    // create request
    await contractCampaign
      .connect(manager)
      .createRequest("Buy a coffee", valueCreateRequest.toString(), otherAccount);

    // approve request
    await contractCampaign.connect(manager).approveRequest(0)

    // finalize request
    await contractCampaign.connect(manager).finalizeRequest(0)

    let balance = await manager.provider.getBalance(manager);
    balance = fromWei(balance, UnitType.Ether);
    balance = parseFloat(balance);

    expect(balance).to.above(104)
  });
});
