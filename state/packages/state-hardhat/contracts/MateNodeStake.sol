// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract MetaNodeStake is AccessControl, ReentrancyGuard, Pausable {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");

    IERC20 public rewardToken;

    struct Pool {
        address stTokenAddress; // 质押的代币地址，0x0表示原生代币
        uint256 poolWeight; // 池的权重，用于计算奖励分配
        uint256 lastRewardBlock; // 上次计算奖励的区块
        uint256 accMetaNodePerST; // 每个质押代币的累计奖励
        uint256 stTokenAmount; // 当前池中质押的代币总量
        uint256 minDepositAmount; // 最小质押金额
        uint256 unstakeLockedBlocks; // 解除质押的锁定区块数
    }

    struct User {
        uint256 stAmount; // 用户质押的代币数量
        uint256 finishedMetaNode; // 用户已领取的奖励数量
        uint256 pendingMetaNode; // 用户待领取的奖励数量
        UnstakeRequest[] requests; // 用户的解除质押请求列表
    }

    struct UnstakeRequest {
        uint256 amount; // 解除质押的代币数量
        uint256 unlockBlock; // 解锁区块号
    }

    Pool[] public pools;
    mapping(uint256 => mapping(address => User)) public users;

    event Staked(address indexed user, uint256 pid, uint256 amount);
    event Unstaked(address indexed user, uint256 pid, uint256 amount);
    event RewardClaimed(address indexed user, uint256 pid, uint256 amount);
    event PoolAdded(uint256 pid, address stTokenAddress);
    event PoolUpdated(uint256 pid);

    constructor(address _rewardToken) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(UPGRADER_ROLE, msg.sender);

        rewardToken = IERC20(_rewardToken);

        // 初始化原生代币池
        pools.push(
            Pool({
                stTokenAddress: address(0),
                poolWeight: 100,
                lastRewardBlock: block.number,
                accMetaNodePerST: 0,
                stTokenAmount: 0,
                minDepositAmount: 0.01 ether,
                unstakeLockedBlocks: 1000 // ~4小时(15秒/块)
            })
        );
    }

    // 质押函数
    function stake(
        uint256 pid,
        uint256 amount
    ) external payable nonReentrant whenNotPaused {
        Pool storage pool = pools[pid];
        User storage user = users[pid][msg.sender];

        require(amount >= pool.minDepositAmount, "Below minimum deposit");
        updatePool(pid);

        if (pool.stTokenAddress == address(0)) {
            require(msg.value == amount, "ETH amount mismatch");
        } else {
            IERC20(pool.stTokenAddress).transferFrom(
                msg.sender,
                address(this),
                amount
            );
        }

        user.stAmount += amount;
        pool.stTokenAmount += amount;

        emit Staked(msg.sender, pid, amount);
    }

    // 解除质押
    function unstake(uint256 pid, uint256 amount) external nonReentrant {
        Pool storage pool = pools[pid];
        User storage user = users[pid][msg.sender];

        require(user.stAmount >= amount, "Insufficient balance");
        updatePool(pid);

        user.stAmount -= amount;
        pool.stTokenAmount -= amount;

        user.requests.push(
            UnstakeRequest({
                amount: amount,
                unlockBlock: block.number + pool.unstakeLockedBlocks
            })
        );

        emit Unstaked(msg.sender, pid, amount);
    }

    // 领取解锁的代币
    function withdrawUnstaked(uint256 pid) external nonReentrant {
        User storage user = users[pid][msg.sender];
        uint256 withdrawable;

        for (uint256 i = 0; i < user.requests.length; i++) {
            if (user.requests[i].unlockBlock <= block.number) {
                withdrawable += user.requests[i].amount;
                user.requests[i] = user.requests[user.requests.length - 1];
                user.requests.pop();
                i--;
            }
        }

        require(withdrawable > 0, "No withdrawable amount");

        Pool storage pool = pools[pid];
        if (pool.stTokenAddress == address(0)) {
            payable(msg.sender).transfer(withdrawable);
        } else {
            IERC20(pool.stTokenAddress).transfer(msg.sender, withdrawable);
        }
    }

    // 领取奖励
    function claimReward(uint256 pid) external nonReentrant whenNotPaused {
        updatePool(pid);
        User storage user = users[pid][msg.sender];

        uint256 pending = user.pendingMetaNode;
        // 打印pengding奖励

        require(pending > 0, "No rewards to claim");

        user.pendingMetaNode = 0;
        user.finishedMetaNode += pending;
        rewardToken.transfer(msg.sender, pending);

        emit RewardClaimed(msg.sender, pid, pending);
    }

    // 管理员添加新池
    function addPool(
        address stTokenAddress,
        uint256 poolWeight,
        uint256 minDepositAmount,
        uint256 unstakeLockedBlocks
    ) external onlyRole(ADMIN_ROLE) {
        pools.push(
            Pool({
                stTokenAddress: stTokenAddress,
                poolWeight: poolWeight,
                lastRewardBlock: block.number,
                accMetaNodePerST: 0,
                stTokenAmount: 0,
                minDepositAmount: minDepositAmount,
                unstakeLockedBlocks: unstakeLockedBlocks
            })
        );

        emit PoolAdded(pools.length - 1, stTokenAddress);
    }

    // 更新池配置
    function updatePoolConfig(
        uint256 pid,
        uint256 poolWeight,
        uint256 minDepositAmount,
        uint256 unstakeLockedBlocks
    ) external onlyRole(ADMIN_ROLE) {
        Pool storage pool = pools[pid];
        pool.poolWeight = poolWeight;
        pool.minDepositAmount = minDepositAmount;
        pool.unstakeLockedBlocks = unstakeLockedBlocks;

        emit PoolUpdated(pid);
    }

    // 更新奖励计算
    function updatePool(uint256 pid) internal {
        Pool storage pool = pools[pid];
        if (block.number <= pool.lastRewardBlock) return;

        if (pool.stTokenAmount > 0) {
            uint256 blocks = block.number - pool.lastRewardBlock;
            uint256 metaNodeReward = (blocks * pool.poolWeight * 1e18) /
                totalWeight(); // 计算奖励总量
            pool.accMetaNodePerST += metaNodeReward / pool.stTokenAmount;
        }

        pool.lastRewardBlock = block.number;
    }

    // 计算总权重
    function totalWeight() public view returns (uint256) {
        uint256 total;
        for (uint256 i = 0; i < pools.length; i++) {
            total += pools[i].poolWeight;
        }
        return total;
    }

    // 计算待领取奖励
    function pendingReward(
        uint256 pid,
        address user
    ) external view returns (uint256) {
        Pool storage pool = pools[pid];
        User storage u = users[pid][user];

        uint256 accMetaNodePerST = pool.accMetaNodePerST;
        if (block.number > pool.lastRewardBlock && pool.stTokenAmount > 0) {
            uint256 blocks = block.number - pool.lastRewardBlock;
            uint256 metaNodeReward = (blocks * pool.poolWeight * 1e18) /
                totalWeight();
            accMetaNodePerST += metaNodeReward / pool.stTokenAmount;
        }

        return
            (u.stAmount * (accMetaNodePerST - u.finishedMetaNode)) /
            1e18 +
            u.pendingMetaNode;
    }

    // 紧急暂停功能
    function emergencyPause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    function emergencyUnpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }
}
