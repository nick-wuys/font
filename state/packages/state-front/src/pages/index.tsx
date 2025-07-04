"use client";
import { useState, useCallback, useEffect } from "react";
import { useAccount, useWalletClient, useBalance } from "wagmi";
import { parseUnits, formatUnits, Abi, Address } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { waitForTransactionReceipt } from "viem/actions";
import { toast } from "react-toastify";

import { useStakeContract } from "@/hooks/useContract";
import Link from "next/link";
import { tokenAbi } from "@/assets/abi/token";
import { stakeAbi } from "@/assets/abi/stake";

const Home = () => {
    const { address, isConnected } = useAccount();
    const { data: walletClient } = useWalletClient();
    const stakeContract = useStakeContract({
        address: process.env.NEXT_PUBLIC_STAKE_ADDRESS as Address,
        abi: stakeAbi as Abi,
    });

    const mtkContract = useStakeContract({
        address: process.env.MTK_TOKEN_ADDRESS as Address,
        abi: tokenAbi as Abi,
    });

    // 状态管理
    const [formValue, setFormValue] = useState({
        amount: "",
        pid: "0",
    });
    const [loading, setLoading] = useState(false);
    const [stakedAmount, setStakedAmount] = useState("0");
    const [rewards, setRewards] = useState("0");
    // 质押池信息
    const poolInfo = { apr: "12.5", lockPeriod: "30" };
    // 可用池列表
    const [availablePools, setAvailablePools] = useState([0]); // 默认只有ETH池

    // 获取钱包余额
    const { data: ethBalance } = useBalance({
        address: address,
    });

    const { data: mtkBalance } = useBalance({
        address: address,
        token: process.env.MTK_TOKEN_ADDRESS as `0x${string}`,
    });

    // 获取质押信息
    const getStakedAmount = useCallback(async () => {
        if (!address || !stakeContract) return;
        try {
            // 这里应该调用您的合约方法
            const userInfo = (await stakeContract.read.users([
                Number(formValue.pid),
                address,
            ])) as bigint[];

            const stakedAmount = formatUnits(userInfo[0] || BigInt(0), 18);
            const pendingMetaNode = userInfo[2] || BigInt(0); // 待领取奖励
            const canClaim = formatUnits(pendingMetaNode, 18); // 可领取奖励

            setStakedAmount(stakedAmount);
            setRewards(canClaim);
        } catch (error) {
            console.error("获取质押金额失败:", error);
            // 如果是池不存在的错误，设置为0
            if (
                error &&
                typeof error === "object" &&
                "message" in error &&
                typeof error.message === "string" &&
                error.message.includes("Array index is out of bounds")
            ) {
                console.log(`池 ${formValue.pid} 不存在，请先创建该池`);
                setStakedAmount("0");
            } else {
                setStakedAmount("0");
            }
        }
    }, [address, stakeContract, formValue.pid]);

    // 质押处理
    const handleStake = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!isConnected) {
            toast.error("请先连接钱包");
            return;
        }

        if (!formValue.amount || parseFloat(formValue.amount) <= 0) {
            toast.error("请输入有效的质押金额");
            return;
        }

        const balance = formValue.pid === "0" ? ethBalance : mtkBalance;
        if (
            parseFloat(formValue.amount) > parseFloat(balance?.formatted || "0")
        ) {
            toast.error("质押金额不能超过钱包余额");
            return;
        }

        try {
            setLoading(true);
            let tx: any;
            const stakeValue = parseUnits(formValue.amount, 18);
            if (formValue.pid === "0") {
                // 质押eth
                tx = await stakeContract?.write.stake(
                    [Number(formValue.pid), stakeValue],
                    {
                        value: stakeValue,
                    }
                );
            } else {
               await mtkContract?.write.approve([
                    process.env.NEXT_PUBLIC_STAKE_ADDRESS as Address,
                    stakeValue,
                ]); // 授权
                tx = await stakeContract?.write.stake([
                    Number(formValue.pid),
                    stakeValue,
                ]);
            }

            const res = await waitForTransactionReceipt(walletClient!, {
                hash: tx!,
            });
            console.log(res);

            toast.success("质押成功！");
            setFormValue({ ...formValue, amount: "" });
            getStakedAmount();
        } catch (error) {
            console.error("质押失败:", error);
            toast.error("质押失败，请重试");
        } finally {
            setLoading(false);
        }
    };

    // 提取奖励
    const handleClaimRewards = async () => {
        if (!isConnected) {
            toast.error("请先连接钱包");
            return;
        }

        if (parseFloat(rewards) <= 0) {
            toast.error("没有可提取的奖励");
            return;
        }

        try {
            setLoading(true);
            // 这里应该调用您的合约提取奖励方法
            const tx = await stakeContract?.write.claimReward([
                Number(formValue.pid),
            ]);
            const res = await waitForTransactionReceipt(walletClient!, {
                hash: tx!,
            });

            toast.success("奖励提取成功！");
        } catch (error) {
            console.error("提取奖励失败:", error);
            toast.error("提取奖励失败，请重试");
        } finally {
            setLoading(false);
        }
    };

    // 取消质押
    const handleUnstake = async () => {
        if (!isConnected) {
            toast.error("请先连接钱包");
            return;
        }

        if (parseFloat(stakedAmount) <= 0) {
            toast.error("没有质押的代币");
            return;
        }

        try {
            setLoading(true);
            // 这里应该调用您的合约取消质押方法
            const tx = await stakeContract?.write.unstake([
                Number(formValue.pid),
                parseUnits(stakedAmount, 18),
            ]);
            const res = await waitForTransactionReceipt(walletClient!, {
                hash: tx!,
            });

            toast.success("取消质押成功！");
            getStakedAmount();
        } catch (error) {
            console.error("取消质押失败:", error);
            toast.error("取消质押失败，请重试");
        } finally {
            setLoading(false);
        }
    };

    // 表单变化处理
    const handleChange = (
        e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
    ) => {
        setFormValue({
            ...formValue,
            [e.target.name]: e.target.value,
        });
    };

    // 设置最大金额
    const setMaxAmount = () => {
        const balance = formValue.pid === "0" ? ethBalance : mtkBalance;
        setFormValue({
            ...formValue,
            amount: balance?.formatted || "0",
        });
    };

    // 检查池是否存在
    const checkPoolExists = useCallback(
        async (pid: number) => {
            if (!stakeContract) return false;
            try {
                const res = await stakeContract.read.pools([pid]);
                return true;
            } catch (error) {
                return false;
            }
        },
        [stakeContract]
    );

    // 获取可用池列表
    const getAvailablePools = useCallback(async () => {
        if (!stakeContract) return;
        const pools = [0]; // 默认ETH池
        // 检查MTK池是否存在
        if (await checkPoolExists(1)) {
            pools.push(1);
        }
        setAvailablePools(pools);
    }, [stakeContract, checkPoolExists]);

    useEffect(() => {
        if (isConnected) {
            getAvailablePools();
            getStakedAmount();
        }
    }, [isConnected, getAvailablePools, getStakedAmount]);

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
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold text-white mb-4">
                        MetaNode{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                            Staking
                        </span>
                    </h1>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                        质押 ETH 或 MTK
                        代币，获得稳定收益。支持灵活质押和奖励提取。
                    </p>
                </div>

                {/* 钱包连接 */}
                <div className="flex justify-center mb-8">
                    <ConnectButton />
                </div>

                {isConnected ? (
                    <div className="max-w-4xl mx-auto">
                        {/* 统计卡片 */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                                <div className="text-gray-300 text-sm mb-2">
                                    总质押量
                                </div>
                                <div className="text-2xl font-bold text-white">
                                    {stakedAmount}{" "}
                                    {formValue.pid === "0" ? "ETH" : "MTK"}
                                </div>
                                <div className="text-green-400 text-sm">
                                    +2.5% 本周
                                </div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                                <div className="text-gray-300 text-sm mb-2">
                                    年化收益率
                                </div>
                                <div className="text-2xl font-bold text-white">
                                    {poolInfo.apr}%
                                </div>
                                <div className="text-blue-400 text-sm">
                                    实时更新
                                </div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                                <div className="text-gray-300 text-sm mb-2">
                                    锁定期
                                </div>
                                <div className="text-2xl font-bold text-white">
                                    {poolInfo.lockPeriod} 天
                                </div>
                                <div className="text-purple-400 text-sm">
                                    灵活质押
                                </div>
                            </div>
                        </div>

                        {/* 质押表单 */}
                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                            <h2 className="text-2xl font-bold text-white mb-6">
                                质押代币
                            </h2>

                            <form onSubmit={handleStake} className="space-y-6">
                                {/* 代币选择 */}
                                <div>
                                    <label className="block text-gray-300 text-sm font-medium mb-2">
                                        选择代币
                                    </label>
                                    <select
                                        name="pid"
                                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={formValue.pid}
                                        onChange={handleChange}
                                    >
                                        {availablePools.includes(0) && (
                                            <option value="0">ETH</option>
                                        )}
                                        {availablePools.includes(1) && (
                                            <option value="1">MTK</option>
                                        )}
                                    </select>
                                </div>

                                {/* 质押金额 */}
                                <div>
                                    <label className="block text-gray-300 text-sm font-medium mb-2">
                                        质押金额
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            name="amount"
                                            placeholder="0.0"
                                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-15"
                                            value={formValue.amount}
                                            onChange={handleChange}
                                            step="0.01"
                                            min="0"
                                        />
                                        <button
                                            type="button"
                                            onClick={setMaxAmount}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-400 hover:text-blue-300 text-sm font-medium"
                                        >
                                            MAX
                                        </button>
                                    </div>
                                    <div className="text-gray-400 text-sm mt-1">
                                        余额:{" "}
                                        {formValue.pid === "0"
                                            ? ethBalance?.formatted
                                            : mtkBalance?.formatted}{" "}
                                        {formValue.pid === "0" ? "ETH" : "MTK"}
                                    </div>
                                </div>

                                {/* 质押按钮 */}
                                <button
                                    type="submit"
                                    disabled={loading || !formValue.amount}
                                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 px-6 rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                >
                                    {loading ? "处理中..." : "质押"}
                                </button>
                            </form>
                        </div>

                        {/* 用户信息 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                            {/* 质押信息 */}
                            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                                <h3 className="text-xl font-bold text-white mb-4">
                                    我的质押
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <span className="text-gray-300">
                                            质押金额
                                        </span>
                                        <span className="text-white font-medium">
                                            {stakedAmount}{" "}
                                            {formValue.pid === "0"
                                                ? "ETH"
                                                : "MTK"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-300">
                                            可领取奖励
                                        </span>
                                        <span className="text-green-400 font-medium">
                                            {rewards} MTK
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={handleClaimRewards}
                                        disabled={
                                            loading || parseFloat(rewards) <= 0
                                        }
                                        className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-color cursor-pointer"
                                    >
                                        领取奖励
                                    </button>
                                    <button
                                        onClick={handleUnstake}
                                        disabled={
                                            loading ||
                                            parseFloat(stakedAmount) <= 0
                                        }
                                        className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                    >
                                        取消质押
                                    </button>
                                </div>
                            </div>

                            {/* 收益预估 */}
                            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                                <h3 className="text-xl font-bold text-white mb-4">
                                    收益预估
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <span className="text-gray-300">
                                            日收益
                                        </span>
                                        <span className="text-white font-medium">
                                            {(
                                                (parseFloat(stakedAmount) *
                                                    parseFloat(poolInfo.apr)) /
                                                365 /
                                                100
                                            ).toFixed(4)}{" "}
                                            MTK
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-300">
                                            月收益
                                        </span>
                                        <span className="text-white font-medium">
                                            {(
                                                (parseFloat(stakedAmount) *
                                                    parseFloat(poolInfo.apr)) /
                                                12 /
                                                100
                                            ).toFixed(4)}{" "}
                                            MTK
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-300">
                                            年收益
                                        </span>
                                        <span className="text-white font-medium">
                                            {(
                                                (parseFloat(stakedAmount) *
                                                    parseFloat(poolInfo.apr)) /
                                                100
                                            ).toFixed(4)}{" "}
                                            MTK
                                        </span>
                                    </div>
                                </div>
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
                                请先连接您的钱包以开始质押
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
