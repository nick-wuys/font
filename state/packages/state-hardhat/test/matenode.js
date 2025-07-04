const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("MetaNodeStake", function () {
  let owner, user1, user2;
  let rewardToken, staking;

  before(async () => {
    [owner, user1, user2] = await ethers.getSigners();

    // 部署MateNodeToken
    const MateNodeToken = await ethers.getContractFactory("MateNodeToken");
    rewardToken = await MateNodeToken.deploy(ethers.parseEther("1000000"));

    // 部署Staking合约
    const MetaNodeStake = await ethers.getContractFactory("MetaNodeStake");
    staking = await MetaNodeStake.deploy(rewardToken.target);

    // 转移奖励代币到Staking合约
    await rewardToken.transfer(staking.target, ethers.parseEther("500000"));
  });

  describe("Native Token Pool", () => {
    // 质押eth
    it("Should stake ETH correctly", async () => {
      const amount = ethers.parseEther("0.01");
      await staking.connect(user1).stake(0, amount, { value: amount });

      const userInfo = await staking.users(0, user1.address);
      expect(userInfo.stAmount).to.equal(amount);
    });

    // 计算奖励
    it("Should calculate rewards", async () => {
      // 前进 100 个区块（假设每个区块间隔 12 秒）
      await ethers.provider.send("evm_increaseTime", [12 * 100]);
      await ethers.provider.send("evm_mine");

      const pending = await staking.pendingReward(0, user1.address);
      expect(pending).to.be.gt(0);
    });

    it("Should claim rewards", async () => {
      // 先确保有足够的区块时间流逝
      await ethers.provider.send("evm_increaseTime", [3600]); // 前进1小时
      await ethers.provider.send("evm_mine");

      // 检查待领取奖励
      const pending = await staking.pendingReward(0, user1.address);
      expect(pending).to.be.gt(0);

      // 领取奖励
      await staking.connect(user1).claimReward(0);

      // 验证奖励已领取
      const newPending = await staking.pendingReward(0, user1.address);
      expect(newPending).to.equal(0);

      console.log("Pending rewards:", ethers.formatEther(pending));
    });
  });

  // 添加ERC20代币池
  describe("ERC20 Token Pool", () => {
    let erc20Token;

    before(async () => {
      // 部署测试ERC20代币
      const ERC20Token = await ethers.getContractFactory("MateNodeToken");
      erc20Token = await ERC20Token.deploy(
        "MateNodeToken",
        "MTK",
        ethers.parseEther("1000000")
      );

      // 添加ERC20池
      await staking.addPool(
        erc20Token.target,
        50, // weight
        ethers.parseEther("10"), // min deposit
        500 // lock blocks
      );

      // 用户授权
      await erc20Token
        .connect(user2)
        .approve(staking.target, ethers.parseEther("100"));
    });

    // 质押ERC20代币
    it("Should stake ERC20 correctly", async () => {
      const amount = ethers.parseEther("20");
      await staking.connect(user2).stake(1, amount);
      const userInfo = await staking.users(1, user2.address);
      expect(userInfo.stAmount).to.equal(amount);
    });
  });
});
