import { encodeFunctionData, erc20Abi, parseUnits, zeroAddress } from "viem";
import { routerABI } from "./abi";
import { ResultRes, SwapRes } from "./types";
import { multicall, readContract } from "viem/actions";
import { client, routerCA, wrappedNative } from "./config";
import { Token } from "./types";

export const zeroAddressCheck = (tokenAddress: string) => {
  return tokenAddress.toLowerCase() === zeroAddress.toLowerCase();
};

export const replaceIfZeroAddress = (tokenAddress: string): `0x${string}` => {
  return zeroAddressCheck(tokenAddress)
    ? wrappedNative
    : (tokenAddress as `0x${string}`);
};

export const noSimilarToken = (tokenIn: Token, tokenOut: Token) => {
  if (tokenIn.address.toLowerCase() === tokenOut.address.toLowerCase()) {
    throw new Error("No SWAP BETWEEN SIMILAR TOKENS");
  }
};

// Build transaction data for Normal token swaps with slippage protection.
export const _swapTokens = async (
  amountIn: bigint,
  minAmountOut: bigint,
  adapters: `0x${string}`[],
  path: `0x${string}`[],
  userAddress: `0x${string}`,
  fee: bigint
) => {
  return encodeFunctionData({
    abi: routerABI,
    functionName: "swapNoSplit",
    args: [
      [amountIn, minAmountOut, path, adapters],
      userAddress as `0x${string}`,
      fee,
    ],
  });
};

// Build transaction data for Swaps that involves Native tokens as either Base or Quote Tokens
export const _swapWithNative = async (
  isBuy: boolean,
  amountIn: bigint,
  minAmountOut: bigint,
  adapters: `0x${string}`[],
  path: `0x${string}`[],
  userAddress: `0x${string}`,
  fee: bigint
) => {
  return encodeFunctionData({
    abi: routerABI,
    functionName: isBuy ? "swapNoSplitFromNative" : "swapNoSplitToNative",
    args: [
      [amountIn, minAmountOut, path, adapters],
      userAddress as `0x${string}`,
      fee,
    ],
  });
};

// Handle checks for balance, allowance and price quote
export const checks = async (
  tokenIn: Token,
  tokenOut: Token,
  userAddress: string
): Promise<
  | { priceData: SwapRes; balanceData: ResultRes; allowanceData: ResultRes }
  | undefined
> => {
  try {
    const calls = [
      {
        address: routerCA,
        abi: routerABI,
        functionName: "findBestPath",
        args: [
          parseUnits("1", tokenIn.decimal),
          tokenIn.address as `0x${string}`,
          replaceIfZeroAddress(tokenOut.address),
          4, // this is the max number of hops we use. The router expects 1 < X <= 5.
        ],
      },
      {
        address: tokenIn.address as `0x${string}`,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [userAddress as `0x${string}`],
      },
      {
        address: tokenIn.address as `0x${string}`,
        abi: erc20Abi,
        functionName: "allowance",
        args: [userAddress as `0x${string}`, routerCA],
      },
    ];

    const [priceData, balanceData, allowanceData] = (await multicall(client, {
      contracts: calls,
    })) as [SwapRes, ResultRes, ResultRes];

    return {
      priceData,
      balanceData,
      allowanceData,
    };
  } catch (error) {
    console.log("error from checks", error);
  }
};

// Check for Native balance and price quote
export const NativeChecks = async (
  tokenIn: Token,
  tokenOut: Token,
  userAddress: string
): Promise<{ priceData: SwapRes; balanceData: ResultRes } | undefined> => {
  try {
    const priceCall = {
      address: routerCA,
      abi: routerABI,
      functionName: "findBestPath",
      args: [
        parseUnits("1", tokenIn.decimal),
        replaceIfZeroAddress(tokenIn.address),
        tokenOut.address as `0x${string}`,
        4, // this is the max number of hops we use. The router expects 1 < X <= 5.
      ],
    };

    const [priceData, balanceData] = (await Promise.allSettled([
      readContract(client, priceCall),
      client.getBalance({
        address: userAddress as `0x${string}`,
      }),
    ])) as [SwapRes, ResultRes];

    return {
      priceData,
      balanceData,
    };
  } catch (error) {
    console.log("error from checks", error);
  }
};
