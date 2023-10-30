import {prepareWriteContract, readContract, waitForTransaction, writeContract} from "@wagmi/core";
import {SUBSCRIPTIONS_ABI, SUBSCRIPTIONS_ADDRESS, WAIT_BLOCK_CONFIRMATIONS} from "@/constants";
import {BigNumber, ethers} from "ethers";

export const createNewSubscriptionByEth = async (id: string, profileId: string, price: BigNumber) => {
    const config = await prepareWriteContract({
        address: SUBSCRIPTIONS_ADDRESS,
        abi: SUBSCRIPTIONS_ABI,
        functionName: 'createNewSubscriptionByEth',
        args: [id, profileId, false, 0, price, []]
    });

    const {hash} = await writeContract(config);
    await waitForTransaction({hash, confirmations: WAIT_BLOCK_CONFIRMATIONS})
}

export const updateSubscriptionTokenAndPrice = async (profileId: string, price: BigNumber) => {
    const config = await prepareWriteContract({
        address: SUBSCRIPTIONS_ADDRESS,
        abi: SUBSCRIPTIONS_ABI,
        functionName: 'setNewTokensAndPrice',
        args: [profileId, 0, [], price]
    });

    const {hash} = await writeContract(config);
    await waitForTransaction({hash, confirmations: WAIT_BLOCK_CONFIRMATIONS})
}

export const getIndexByHexId = async (subscriptionId: `0x${string}`) => {
    return await readContract({
        address: SUBSCRIPTIONS_ADDRESS,
        abi: SUBSCRIPTIONS_ABI,
        functionName: 'getSubscriptionIndexByHexId',
        args: [subscriptionId]
    }).then(data => {
        return (data as string[])[1];
    });

}

export const payForSubscriptionByEth = async (
    subscriptionId: `0x${string}`,
    profileId: string,
    subscriptionIndex: number,
    price: string,
) => {
    const value = ethers.utils.parseEther(price);
    const config = await prepareWriteContract({
        address: SUBSCRIPTIONS_ADDRESS,
        abi: SUBSCRIPTIONS_ABI,
        functionName: 'subscriptionPayment',
        args: [
            profileId,
            subscriptionIndex,
            '0x0000000000000000000000000000000000000000',
            1,
        ],
        overrides: {
            value: value,
        }
    });

    const {hash} = await writeContract(config);
    await waitForTransaction({hash, confirmations: WAIT_BLOCK_CONFIRMATIONS})
}

