import {prepareWriteContract, readContract, waitForTransaction, writeContract} from "@wagmi/core";
import {MAIN_NFT_ABI, MAIN_NFT_ADDRESS, PUBLIC_DONATION_ABI, PUBLIC_DONATION_ADDRESS} from "@/constants";
import {symbolByAddress} from "@/utils/tokens";
import { BigNumber } from "ethers";

export const loadAvailableTokens = async (profileId: string): Promise<string[]> => {
    return readContract({
        address: PUBLIC_DONATION_ADDRESS,
        abi: PUBLIC_DONATION_ABI,
        functionName: 'getAllDonateTokenAddressesByAuthor',
        args: [profileId]
    }).then(data => {
        return (data as string[]).map(address => symbolByAddress.get(address as `0x${string}`)) as string[];
    });
};

export const loadProfileOwner = async (profileId: string): Promise<string> => {
    return readContract({
        address: MAIN_NFT_ADDRESS,
        abi: MAIN_NFT_ABI,
        functionName: 'ownerOf',
        args: [profileId]
    }).then(data => data as string);
}

export const enableOrDisableToken = async (profileId: string, tokenAddress: string, enable: boolean): Promise<void> => {
    const functionName = enable ? 'addDonateAddress' : 'removeDonateAddress';
    const config = await prepareWriteContract({
        address: PUBLIC_DONATION_ADDRESS,
        abi: PUBLIC_DONATION_ABI,
        functionName: functionName,
        args: [tokenAddress, profileId]
    })
    const {hash} = await writeContract(config);
    await waitForTransaction({hash: hash});
}

export const getBalanceNftOfAddress  = async (address: string): Promise<number> => {
    return readContract({
        address: MAIN_NFT_ADDRESS,
        abi: MAIN_NFT_ABI,
        functionName: 'balanceOf',
        args: [address]
    }).then(data => data as number);
}

export const getProfileIdByOwnerAndIndex = async (address: string, index: number): Promise<string> => {
    return readContract({
        address: MAIN_NFT_ADDRESS,
        abi: MAIN_NFT_ABI,
        functionName: 'tokenOfOwnerByIndex',
        args: [address, BigNumber.from(index)]
    }).then(data => data as string);
}