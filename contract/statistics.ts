import {
  prepareWriteContract,
  readContract,
  waitForTransaction,
  writeContract,
} from "@wagmi/core";
import {
  MAIN_NFT_ABI,
  MAIN_NFT_ADDRESS,
} from "@/constants";
import { BigNumber, utils } from "ethers";

export const getTokenURI = async (profileId: string): Promise<string> => {
  return readContract({
    address: MAIN_NFT_ADDRESS,
    abi: MAIN_NFT_ABI,
    functionName: "tokenURI",
    args: [profileId],
  }).then((data) => data as string);
};

export const getAuthorsAmountsInETH = async (
  profileId: string
): Promise<string> => {
  return readContract({
    address: MAIN_NFT_ADDRESS,
    abi: MAIN_NFT_ABI,
    functionName: "authorsAmountsInETH",
    args: [profileId],
  })
    .then((data) => parseFloat(utils.formatEther(data as BigNumber)).toFixed(2))
    .catch(() => {
      return "0.00";
    });
};

export const getAuthorsAmountsInUSD = async (
  profileId: string
): Promise<string> => {
  return readContract({
    address: MAIN_NFT_ADDRESS,
    abi: MAIN_NFT_ABI,
    functionName: "authorsAmountsInUSD",
    args: [profileId],
  })
    .then((data) =>
      parseFloat(utils.formatUnits(data as BigNumber, 4)).toFixed(2)
    )
    .catch(() => {
      return "0.00";
    });
};
