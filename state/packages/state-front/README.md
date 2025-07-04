# MetaNode Staking Frontend

这是一个现代化的Web3质押平台前端应用，支持ETH和MTK代币的质押功能。

## 功能特性

- 🎨 现代化UI设计，支持深色主题
- 🔗 钱包连接（支持MetaMask、WalletConnect等）
- 💰 多代币质押（ETH、MTK）
- 📊 实时数据展示（质押量、收益率、锁定期）
- 🎯 收益预估计算
- 🔄 奖励提取和取消质押
- 📱 响应式设计，支持移动端

## 技术栈

- **框架**: Next.js 15
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **Web3**: Wagmi + Viem
- **钱包**: RainbowKit
- **状态管理**: React Hooks
- **通知**: React Toastify

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 环境配置

创建 `.env.local` 文件并配置以下环境变量：

```env
# 质押合约地址
NEXT_PUBLIC_STAKE_ADDRESS=0x...

# MTK代币地址
NEXT_PUBLIC_MTK_TOKEN_ADDRESS=0x...

# 网络配置
NEXT_PUBLIC_CHAIN_ID=1
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 项目结构

```
src/
├── assets/
│   └── abi/           # 合约ABI文件
├── components/        # React组件
├── hooks/            # 自定义Hooks
├── pages/            # 页面组件
├── styles/           # 样式文件
├── utils/            # 工具函数
└── wagmi.ts          # Wagmi配置
```

## 主要功能

### 质押功能
- 支持ETH和MTK代币质押
- 实时余额检查
- 最大金额快速设置
- 交易状态反馈

### 数据展示
- 总质押量统计
- 年化收益率显示
- 锁定期信息
- 个人质押详情

### 收益管理
- 待领取奖励显示
- 一键提取奖励
- 取消质押功能
- 收益预估计算

## 合约集成

应用集成了以下合约方法：

- `stake(pid, amount)` - 质押代币
- `unstake(pid, amount)` - 取消质押
- `claimReward(pid)` - 提取奖励
- `users(pid, user)` - 获取用户质押信息
- `pendingReward(pid, user)` - 获取待领取奖励

## 开发说明

### 添加新的质押池

1. 在合约中添加新的质押池
2. 更新前端UI以支持新的池ID
3. 测试质押和提取功能

### 自定义样式

项目使用Tailwind CSS，您可以在 `src/styles/globals.css` 中添加自定义样式。

### 合约地址配置

确保在环境变量中正确配置合约地址，否则应用将无法正常工作。

## 部署

### 构建生产版本

```bash
npm run build
```

### 启动生产服务器

```bash
npm start
```

## 贡献

欢迎提交Issue和Pull Request来改进这个项目。

## 许可证

MIT License
