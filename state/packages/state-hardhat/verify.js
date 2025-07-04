const { run } = require("hardhat");

async function verify(contractAddress, args, retries = 3) {
  console.log("验证合约:", contractAddress);
  console.log("构造函数参数:", args);
  
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`尝试验证 (${i + 1}/${retries})...`);
      await run("verify:verify", {
        address: contractAddress,
        constructorArguments: args,
      });
      console.log("✅ 合约验证成功！");
      return true;
    } catch (error) {
      console.log("详细错误信息:", error);
      if (error.message.includes("Already Verified")) {
        console.log("ℹ️ 合约已经验证过了");
        return true;
      } else if (error.message.includes("Connect Timeout") || error.message.includes("timeout")) {
        console.log(`⏳ 连接超时，等待后重试... (${i + 1}/${retries})`);
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, 10000)); // 等待10秒
        }
      } else {
        console.log("❌ 验证失败:", error.message);
        return false;
      }
    }
  }
  
  console.log("❌ 验证失败，已达到最大重试次数");
  return false;
}

async function main() {
  // 这里需要填入实际部署的合约地址
  const MATE_NODE_TOKEN_ADDRESS = "0x81567fD3fcE90B447bEa99BA38A92f0Ee5cDc7da"; // 请替换为实际地址
  const MATE_NODE_STAKE_ADDRESS = "0x3E1bB3Eb184DC880bf524FaB770037ea04a2C4Cc"; // 请替换为实际地址
  
  console.log("开始验证合约...");
  
  // 验证MateNodeToken合约 - 尝试不同的参数格式
  console.log("\n1. 验证MateNodeToken合约...");
  await verify(MATE_NODE_TOKEN_ADDRESS, [10000000]);
  
  // 验证MateNodeStake合约
  console.log("\n2. 验证MateNodeStake合约...");
  await verify(MATE_NODE_STAKE_ADDRESS, [MATE_NODE_TOKEN_ADDRESS]); // rewardToken地址
  
  console.log("\n所有合约验证完成！");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 