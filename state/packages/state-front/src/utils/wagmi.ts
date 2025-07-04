import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "viem";
import { sepolia } from "wagmi/chains";

export const config = getDefaultConfig({
    appName: "MetaNode Stake",
    projectId: process.env.PROJECT_ID || "",
    chains: [sepolia],
    transports: {
        [sepolia.id]: http(process.env.SEPOLIA_RPC_URL || ""),
    },
    ssr: true,
});

export const defaultChainId: number = sepolia.id;
