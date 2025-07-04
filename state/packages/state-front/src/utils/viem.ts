import { sepolia } from "viem/chains";
import { PublicClient, createPublicClient, http } from "viem";

export const viemClients = (chaiId: number): PublicClient => {
    const clients: {
        [key: number]: PublicClient;
    } = {
        [sepolia.id]: createPublicClient({
            chain: sepolia,
            transport: http(process.env.SEPOLIA_RPC_URL || ""),
        }),
    };
    return clients[chaiId];
};
