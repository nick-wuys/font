const { ethers } = require("hardhat");

async function main() {
  console.log("开始部署合约到Sepolia测试网...");

  // 获取部署者账户
  const [deployer] = await ethers.getSigners();
  console.log("部署者地址:", deployer.address);
  console.log("部署者余额:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");

  // 部署MateNodeToken合约
  console.log("\n1. 部署MateNodeToken合约...");
  const MateNodeToken = await ethers.getContractFactory("MateNodeToken");
  const initialSupply = 10000000; // 1000万代币
  const mateNodeToken = await MateNodeToken.deploy(initialSupply);
  await mateNodeToken.waitForDeployment();
  const tokenAddress = await mateNodeToken.getAddress();
  console.log("MateNodeToken部署地址:", tokenAddress);

  // 部署MateNodeStake合约
  console.log("\n2. 部署MateNodeStake合约...");
  const MateNodeStake = await ethers.getContractFactory("MetaNodeStake");
  const mateNodeStake = await MateNodeStake.deploy(tokenAddress);
  await mateNodeStake.waitForDeployment();
  const stakeAddress = await mateNodeStake.getAddress();
  console.log("MateNodeStake部署地址:", stakeAddress);

  // 验证部署
  console.log("\n3. 验证部署...");
  const tokenBalance = await mateNodeToken.balanceOf(deployer.address);
  console.log("部署者代币余额:", ethers.formatEther(tokenBalance), "MTK");
  
  const rewardTokenAddress = await mateNodeStake.rewardToken();
  console.log("质押合约奖励代币地址:", rewardTokenAddress);
  console.log("代币合约地址:", tokenAddress);
  console.log("地址匹配:", rewardTokenAddress === tokenAddress);

  console.log("\n部署完成！");
  console.log("合约地址信息:");
  console.log("- MateNodeToken:", tokenAddress);
  console.log("- MateNodeStake:", stakeAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 