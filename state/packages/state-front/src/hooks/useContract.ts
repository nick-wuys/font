import { useMemo } from "react";
import { Abi, Address, zeroAddress } from "viem";
import { useChainId, useWalletClient } from "wagmi";
import { getContract } from "@/utils/contractHelper";

type UseContractOptions = {
    chainId?: number;
};

export function useContract<TAbi extends Abi>(
    addressOrAddressMap?: Address | { [chainId: number]: Address },
    abi?: TAbi,
    options?: UseContractOptions
) {
    const currentChainId = useChainId();
    const chainId = options?.chainId || currentChainId;
    const { data: walletClient } = useWalletClient();

    return useMemo(() => {
        if (!addressOrAddressMap || !abi || !chainId) return null;
        let address: Address | undefined;
        if (typeof addressOrAddressMap === "string")
            address = addressOrAddressMap;
        else address = addressOrAddressMap[chainId];
        if (!address) return null;
        try {
            return getContract({
                abi,
                address,
                chainId,
                signer: walletClient ?? undefined,
            });
        } catch (error) {
            console.error("Failed to get contract", error);
            return null;
        }
    }, [addressOrAddressMap, abi, chainId, walletClient]);
}

interface Props {
    address?: Address;
    abi?: Abi;
}

export const useStakeContract = (props: Props = {}) => {
    const StakeContractAddress = props.address || zeroAddress; // 质押合约地址
    return useContract(StakeContractAddress, props.abi);
};


