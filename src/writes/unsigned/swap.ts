import type { Token } from "../../types";
import {
  _swapWithNative,
  calcMinAmountOut,
  checks,
  checksNative,
  noSimilarToken,
  returnFunctionData,
  zeroAddressCheck,
} from "../../helpers";

export interface SwapTransactionParams {
  tokenIn: Token;
  tokenOut: Token;
  amountIn: bigint;
  userAddress: string;
  slippageTolerance?: number; // in basis points (e.g., 50 = 0.5%)
}

export interface UnsignedTransaction {
  to: string;
  data: string;
  value: bigint;
  from: string;
}

export type _Swap = (
  tokenIn: Token,
  tokenOut: Token,
  amountIn: bigint,
  userAddress: `0x${string}`,
  slippageTolerance: number,
  toNative?: boolean
) => Promise<UnsignedTransaction | undefined>;

/**
 * Creates an unsigned ExactTokenToTokens swap transaction
 * @param params {@link SwapTransactionParams} parameters
 * @returns Unsigned transaction data for user to sign
 */
export const swap = async (
  params: SwapTransactionParams
): Promise<UnsignedTransaction | undefined> => {
  const {
    tokenIn,
    tokenOut,
    amountIn,
    userAddress,
    slippageTolerance = 100, // Default 1%
  } = params;

  noSimilarToken(tokenIn, tokenOut);

  try {
    if (zeroAddressCheck(tokenIn.address)) {
      console.log("swapNoSplitFromNative");
      return swapFromNative(
        tokenIn,
        tokenOut,
        amountIn,
        userAddress as `0x${string}`,
        slippageTolerance
      );
    } else if (zeroAddressCheck(tokenOut.address)) {
      console.log("swapNoSplitToNative");
      return tokenSwap(
        tokenIn,
        tokenOut,
        amountIn,
        userAddress as `0x${string}`,
        slippageTolerance,
        true //swapping to Native token. toNative param set to true
      );
    } else {
      console.log("swapNoSplit");
      return tokenSwap(
        tokenIn,
        tokenOut,
        amountIn,
        userAddress as `0x${string}`,
        slippageTolerance
      );
    }
  } catch (error) {
    console.error("error from swap", error);
  }
};

const tokenSwap: _Swap = async (
  tokenIn,
  tokenOut,
  amountIn,
  userAddress,
  slippageTolerance,
  toNative
) => {
  const res = await checks(
    amountIn,
    tokenIn,
    tokenOut,
    userAddress as `0x${string}`
  );
  if (!res) throw new Error("Invalid response from basic checks");
  const { allowanceData, balanceData, swapData } = res;
  if (!swapData.result?.path.length) throw new Error("Path Not found");
  if (!balanceData.result || balanceData.result < amountIn)
    throw new Error("Insufficient balance, top up TokenIn balance");
  if (!allowanceData.result || allowanceData.result < amountIn)
    throw new Error("Insufficient Allowance, Increase Token Approval");
  const minAmountOut = calcMinAmountOut(swapData, slippageTolerance);

  return returnFunctionData(
    toNative ? "swapNoSplitToNative" : "swapNoSplit",
    amountIn,
    minAmountOut,
    swapData,
    userAddress
  );
};

const swapFromNative: _Swap = async (
  tokenIn,
  tokenOut,
  amountIn,
  userAddress,
  slippageTolerance
) => {
  const res = await checksNative(amountIn, tokenIn, tokenOut, userAddress);
  if (!res) throw new Error("Failed to Get response");
  const { balanceData, swapData } = res;

  if (!swapData.value?.path.length || !swapData.value?.amounts.length)
    throw new Error("Path unavailable");

  if ((balanceData?.value as bigint) < amountIn)
    throw new Error("Insufficient Native token Balance");
  const minAmountOut = calcMinAmountOut(swapData, slippageTolerance);

  return returnFunctionData(
    "swapNoSplitFromNative",
    amountIn,
    minAmountOut,
    swapData,
    userAddress,
    amountIn
  );
};
