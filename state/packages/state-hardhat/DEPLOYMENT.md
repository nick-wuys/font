# Sepolia测试网部署指南

## 准备工作

### 1. 获取必要的API密钥

1. **Infura API Key**
   - 访问 https://infura.io/
   - 注册账户并创建新项目
   - 复制项目的API Key

2. **Etherscan API Key**
   - 访问 https://etherscan.io/
   - 注册账户并登录
   - 在API-KEYs页面创建新的API Key

3. **Sepolia测试网ETH**
   - 访问 https://sepoliafaucet.com/
   - 输入你的钱包地址获取测试ETH

### 2. 配置环境变量

在 `packages/state-hardhat/` 目录下创建 `.env` 文件：

```bash
# Infura API Key (用于连接Sepolia测试网)
INFURA_API_KEY=your_infura_api_key_here

# 部署者私钥 (请确保账户有足够的Sepolia ETH)
PRIVATE_KEY=your_private_key_here

# Etherscan API Key (用于合约验证)
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

**⚠️ 安全提醒：**
- 永远不要将包含真实私钥的 `.env` 文件提交到Git
- 确保 `.env` 文件已添加到 `.gitignore` 中

## 部署步骤

### 1. 安装依赖

```bash
cd packages/state-hardhat
npm install
```

### 2. 编译合约

```bash
npx hardhat compile
```

### 3. 部署到Sepolia测试网

```bash
npx hardhat run deploy.js --network sepolia
```

部署完成后，你会看到类似以下的输出：
```
开始部署合约到Sepolia测试网...
部署者地址: 0x...
部署者余额: 1.234 ETH

1. 部署MateNodeToken合约...
MateNodeToken部署地址: 0x...

2. 部署MateNodeStake合约...
MateNodeStake部署地址: 0x...

3. 验证部署...
部署者代币余额: 10000000.0 MTK
质押合约奖励代币地址: 0x...
代币合约地址: 0x...
地址匹配: true

部署完成！
合约地址信息:
- MateNodeToken: 0x...
- MateNodeStake: 0x...
```

### 4. 验证合约

1. 复制部署脚本输出的合约地址
2. 编辑 `verify.js` 文件，将合约地址填入相应位置
3. 需要先设置命令行翻墙，填写合约地址
4. 运行验证命令：

```bash
npx hardhat run verify.js --network sepolia
```

## 合约功能验证

### MateNodeToken合约
- **名称**: MateNodeToken
- **符号**: MTK
- **初始供应量**: 100,000,000 MTK
- **功能**: ERC20代币，支持增发

### MateNodeStake合约
- **功能**: 质押挖矿合约
- **支持**: ETH质押和ERC20代币质押
- **奖励**: MTK代币
- **锁定期**: 约4小时（1000个区块）

## 常见问题

### 1. 部署失败
- 检查账户是否有足够的Sepolia ETH
- 确认环境变量配置正确
- 检查网络连接

### 2. 验证失败
- 确认Etherscan API Key正确
- 检查构造函数参数是否匹配
- 等待几分钟后重试（Etherscan需要时间索引）

### 3. 合约交互
- 使用Etherscan的"Write Contract"功能测试合约
- 或使用前端应用进行交互

## 合约地址

部署完成后，请记录以下地址：
- **MateNodeToken**: `0x...`
- **MateNodeStake**: `0x...`

这些地址将用于前端应用配置和合约交互。 