"use client";
import { useState, useCallback, useEffect } from "react";
import { useAccount, useWalletClient, useBalance } from "wagmi";
import { parseUnits, formatUnits, Abi, Address } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { waitForTransactionReceipt } from "viem/actions";
import { toast } from "react-toastify";
import Link from "next/link";

import { useStakeContract } from "@/hooks/useContract";
import { stakeAbi } from "@/assets/abi/stake";

interface PoolInfo {
    pid: number;
    name: string;
    symbol: string;
    stakedAmount: string;
    pendingReward: string;
    canClaim: string;
    totalReward: string;
}

const Withdraw = () => {
    const { address, isConnected } = useAccount();
    const { data: walletClient } = useWalletClient();
    const stakeContract = useStakeContract({
        address: process.env.NEXT_PUBLIC_STAKE_ADDRESS as Address,
        abi: stakeAbi as Abi,
    });

    // 状态管理
    const [loading, setLoading] = useState(false);
    const [pools, setPools] = useState<PoolInfo[]>([]);
    const [selectedPools, setSelectedPools] = useState<number[]>([]);
    const [totalClaimable, setTotalClaimable] = useState("0");

    // 检查池是否存在
    const checkPoolExists = useCallback(
        async (pid: number) => {
            if (!stakeContract) return false;
            try {
                await stakeContract.read.pools([pid]);
                return true;
            } catch (error) {
                return false;
            }
        },
        [stakeContract]
    );

    // 获取用户在所有池的质押和奖励信息
    const getUserPoolsInfo = useCallback(async () => {
        if (!address || !stakeContract) return;

        const poolsInfo: PoolInfo[] = [];
        const poolNames = ["ETH", "MTK"];

        for (let pid = 0; pid < 2; pid++) {
            try {
                // 检查池是否存在
                const poolExists = await checkPoolExists(pid);
                if (!poolExists) continue;

                // 获取用户质押信息
                const userInfo = (await stakeContract.read.users([
                    pid,
                    address,
                ])) as any;

                const stakedAmount = formatUnits(userInfo[0] || BigInt(0), 18);
                const finishedMetaNode = userInfo[1] || BigInt(0);
                const pendingMetaNode = userInfo[2] || BigInt(0);
                const canClaim = formatUnits(pendingMetaNode, 18);
                const totalReward = formatUnits(
                    finishedMetaNode + pendingMetaNode,
                    18
                );

                // 获取待领取奖励
                const pendingReward = (await stakeContract.read.pendingReward([
                    pid,
                    address,
                ])) as bigint;
                const pendingRewardFormatted = formatUnits(pendingReward, 18);

                poolsInfo.push({
                    pid,
                    name: poolNames[pid],
                    symbol: poolNames[pid],
                    stakedAmount,
                    pendingReward: pendingRewardFormatted,
                    canClaim,
                    totalReward,
                });
            } catch (error) {
                console.error(`获取池 ${pid} 信息失败:`, error);
            }
        }

        setPools(poolsInfo);
    }, [address, stakeContract, checkPoolExists]);

    // 选择/取消选择池
    const togglePoolSelection = (pid: number) => {
        setSelectedPools((prev) =>
            prev.includes(pid) ? prev.filter((p) => p !== pid) : [...prev, pid]
        );
    };

    // 选择所有池
    const selectAllPools = () => {
        const allPids = pools.map((p) => p.pid);
        setSelectedPools(allPids);
    };

    // 取消选择所有池
    const deselectAllPools = () => {
        setSelectedPools([]);
    };

    // 计算总可领取奖励
    useEffect(() => {
        const total = pools
            .filter((pool) => selectedPools.includes(pool.pid))
            .reduce((sum, pool) => sum + parseFloat(pool.canClaim), 0);
        setTotalClaimable(total.toFixed(6));
    }, [pools, selectedPools]);

    // 领取单个池的奖励
    const claimSinglePool = async (pid: number) => {
        if (!isConnected) {
            toast.error("请先连接钱包");
            return;
        }

        const pool = pools.find((p) => p.pid === pid);
        if (!pool || parseFloat(pool.canClaim) <= 0) {
            toast.error("没有可领取的奖励");
            return;
        }

        try {
            setLoading(true);
            const tx = await stakeContract?.write.claimReward([pid]);
            const res = await waitForTransactionReceipt(walletClient!, {
                hash: tx!,
            });
            console.log("领取奖励成功:", res);

            toast.success(`${pool.name} 池奖励领取成功！`);
            getUserPoolsInfo(); // 刷新数据
        } catch (error) {
            console.error("领取奖励失败:", error);
            if (error && typeof error === "object" && "message" in error) {
                const errorMsg = error.message as string;
                if (errorMsg.includes("No rewards to claim")) {
                    toast.error("没有可领取的奖励，请先进行质押或等待奖励累计");
                } else {
                    toast.error("领取奖励失败，请重试");
                }
            } else {
                toast.error("领取奖励失败，请重试");
            }
        } finally {
            setLoading(false);
        }
    };

    // 批量领取奖励
    const claimAllSelected = async () => {
        if (!isConnected) {
            toast.error("请先连接钱包");
            return;
        }

        if (selectedPools.length === 0) {
            toast.error("请选择要领取的池");
            return;
        }

        if (parseFloat(totalClaimable) <= 0) {
            toast.error("没有可领取的奖励");
            return;
        }

        try {
            setLoading(true);
            let successCount = 0;
            let failCount = 0;

            for (const pid of selectedPools) {
                try {
                    const tx = await stakeContract?.write.claimReward([pid]);
                    await waitForTransactionReceipt(walletClient!, {
                        hash: tx!,
                    });
                    successCount++;
                } catch (error) {
                    console.error(`池 ${pid} 领取失败:`, error);
                    failCount++;
                }
            }

            if (successCount > 0) {
                toast.success(`成功领取 ${successCount} 个池的奖励！`);
            }
            if (failCount > 0) {
                toast.warning(`${failCount} 个池领取失败，请单独重试`);
            }

            getUserPoolsInfo(); // 刷新数据
            setSelectedPools([]); // 清空选择
        } catch (error) {
            console.error("批量领取失败:", error);
            toast.error("批量领取失败，请重试");
        } finally {
            setLoading(false);
        }
    };

    // 取消质押
    const handleUnstake = async (pid: number, amount: string) => {
        if (!isConnected) {
            toast.error("请先连接钱包");
            return;
        }

        if (parseFloat(amount) <= 0) {
            toast.error("没有质押的代币");
            return;
        }

        try {
            setLoading(true);
            const tx = await stakeContract?.write.unstake([
                pid,
                parseUnits(amount, 18),
            ]);
            const res = await waitForTransactionReceipt(walletClient!, {
                hash: tx!,
            });
            console.log("取消质押成功:", res);

            toast.success("取消质押成功！");
            getUserPoolsInfo();
        } catch (error) {
            console.error("取消质押失败:", error);
            toast.error("取消质押失败，请重试");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isConnected) {
            getUserPoolsInfo();
        }
    }, [isConnected, getUserPoolsInfo]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
            {/* 背景装饰 */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            <div className="relative z-10 container mx-auto px-4 py-8">
                {/* 头部 */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-4">
                        奖励领取中心
                    </h1>
                    <p className="text-lg text-gray-300">
                        查看和管理您的质押奖励
                    </p>
                </div>

                {/* 钱包连接 */}
                <div className="flex justify-center mb-8">
                    <ConnectButton />
                </div>

                {isConnected ? (
                    <div className="max-w-6xl mx-auto">
                        {/* 批量操作 */}
                        {pools.length > 0 && (
                            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-6">
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={selectAllPools}
                                            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                                        >
                                            全选
                                        </button>
                                        <button
                                            onClick={deselectAllPools}
                                            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                                        >
                                            取消全选
                                        </button>
                                    </div>
                                    <div className="text-white">
                                        已选择: {selectedPools.length} 个池
                                    </div>
                                    <div className="text-white">
                                        总可领取: {totalClaimable} MTK
                                    </div>
                                    <button
                                        onClick={claimAllSelected}
                                        disabled={
                                            loading ||
                                            selectedPools.length === 0 ||
                                            parseFloat(totalClaimable) <= 0
                                        }
                                        className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {loading ? "处理中..." : "批量领取"}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* 池列表 */}
                        {pools.length > 0 ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {pools.map((pool) => (
                                    <div
                                        key={pool.pid}
                                        className={`bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 cursor-pointer transition-all ${
                                            selectedPools.includes(pool.pid)
                                                ? "border-blue-400 bg-blue-500/20"
                                                : "hover:border-white/40"
                                        }`}
                                        onClick={() =>
                                            togglePoolSelection(pool.pid)
                                        }
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-xl font-bold text-white">
                                                {pool.name} 池
                                            </h3>
                                            <input
                                                type="checkbox"
                                                checked={selectedPools.includes(
                                                    pool.pid
                                                )}
                                                onChange={() =>
                                                    togglePoolSelection(
                                                        pool.pid
                                                    )
                                                }
                                                className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                            />
                                        </div>

                                        <div className="space-y-3 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-300">
                                                    质押金额
                                                </span>
                                                <span className="text-white font-medium">
                                                    {parseFloat(
                                                        pool.stakedAmount
                                                    ) > 0
                                                        ? `${pool.stakedAmount} ${pool.symbol}`
                                                        : "未质押"}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-300">
                                                    理论奖励
                                                </span>
                                                <span className="text-blue-400 font-medium">
                                                    {pool.pendingReward} MTK
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-300">
                                                    可领取奖励
                                                </span>
                                                <span className="text-green-400 font-medium">
                                                    {pool.canClaim} MTK
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-300">
                                                    总奖励
                                                </span>
                                                <span className="text-purple-400 font-medium">
                                                    {pool.totalReward} MTK
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex gap-3 mt-6">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    claimSinglePool(pool.pid);
                                                }}
                                                disabled={
                                                    loading ||
                                                    parseFloat(pool.canClaim) <=
                                                        0
                                                }
                                                className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                {loading
                                                    ? "处理中..."
                                                    : "领取奖励"}
                                            </button>
                                            {parseFloat(pool.stakedAmount) >
                                                0 && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleUnstake(
                                                            pool.pid,
                                                            pool.stakedAmount
                                                        );
                                                    }}
                                                    disabled={loading}
                                                    className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    {loading
                                                        ? "处理中..."
                                                        : "取消质押"}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center">
                                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 border border-white/20 max-w-md mx-auto">
                                    <div className="text-6xl mb-4">🎁</div>
                                    <h3 className="text-xl font-bold text-white mb-2">
                                        暂无质押记录
                                    </h3>
                                    <p className="text-gray-300 mb-4">
                                        您还没有在任何池中质押代币
                                    </p>
                                    <Link
                                        href="/"
                                        className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                                    >
                                        去质押
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* 说明 */}
                        <div className="mt-8 bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                            <h3 className="text-lg font-bold text-white mb-4">
                                使用说明
                            </h3>
                            <div className="text-gray-300 space-y-2 text-sm">
                                <p>
                                    • <strong>理论奖励</strong>
                                    ：根据当前质押情况计算的应得奖励（包含未结算部分）
                                </p>
                                <p>
                                    • <strong>可领取奖励</strong>
                                    ：实际可以立即领取的奖励金额
                                </p>
                                <p>
                                    • <strong>总奖励</strong>：已领取 +
                                    待领取的奖励总和
                                </p>
                                <p>
                                    •
                                    如果"可领取奖励"为0，请先进行质押或等待奖励累计
                                </p>
                                <p>• 支持批量选择多个池同时领取奖励</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center">
                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 border border-white/20 max-w-md mx-auto">
                            <div className="text-6xl mb-4">🔒</div>
                            <h3 className="text-xl font-bold text-white mb-2">
                                连接钱包
                            </h3>
                            <p className="text-gray-300">
                                请先连接您的钱包以查看奖励信息
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Withdraw;
