const { ethers } = require("hardhat");

async function main() {
  console.log("开始添加MTK池到质押合约...");

  // 获取部署者账户
  const [deployer] = await ethers.getSigners();
  console.log("部署者地址:", deployer.address);

  // 合约地址（需要根据实际部署的地址修改）
  const STAKE_CONTRACT_ADDRESS = "0x3E1bB3Eb184DC880bf524FaB770037ea04a2C4Cc"; // 请替换为实际的质押合约地址
  const MTK_TOKEN_ADDRESS = "0xBe821dE972C291Aae54c998b45901e805CE4fc73"; // 请替换为实际的MTK代币地址

  // 获取合约实例
  const stakeContract = await ethers.getContractAt("MetaNodeStake", STAKE_CONTRACT_ADDRESS);
  
  console.log("质押合约地址:", STAKE_CONTRACT_ADDRESS);
  console.log("MTK代币地址:", MTK_TOKEN_ADDRESS);

  // 添加MTK池
  console.log("\n添加MTK池...");
  const tx = await stakeContract.addPool(
    MTK_TOKEN_ADDRESS, // stTokenAddress
    100, // poolWeight (与ETH池相同权重)
    ethers.parseEther("1"), // minDepositAmount (1 MTK)
    1000 // unstakeLockedBlocks (~4小时)
  );
  
  await tx.wait();
  console.log("MTK池添加成功！");

  // 验证池是否添加成功
  const poolCount = await stakeContract.pools.length;
  console.log("当前池数量:", poolCount);
  
  const pool1 = await stakeContract.pools(1);
  console.log("池1信息:", {
    stTokenAddress: pool1.stTokenAddress,
    poolWeight: pool1.poolWeight.toString(),
    minDepositAmount: ethers.formatEther(pool1.minDepositAmount),
    unstakeLockedBlocks: pool1.unstakeLockedBlocks.toString()
  });

  console.log("\nMTK池添加完成！");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 