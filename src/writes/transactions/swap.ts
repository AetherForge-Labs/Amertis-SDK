import { routerCA, wrappedNative } from "../../config";
import { routerABI } from "../../abi";
import type { Token } from "../../types";
import { _swapWithNative, checks, zeroAddressCheck } from "../../helpers";
import { parseUnits, zeroAddress } from "viem";

export interface SwapTransactionParams {
  tokenIn: Token;
  tokenOut: Token;
  amountIn: bigint;
  userAddress: string;
  slippageTolerance?: number; // in basis points (e.g., 50 = 0.5%)
}

export interface UnsignedTransaction {
  to: `0x${string}`;
  data: `0x${string}`;
  value: bigint;
  from: `0x${string}`;
}

/**
 * Creates an unsigned ExactTokenToTokens swap transaction
 * @param params {@link SwapTransactionParams} parameters
 * @returns Unsigned transaction data for user to sign
 */
export const swap = async (params: SwapTransactionParams) => {
  const {
    tokenIn,
    tokenOut,
    amountIn,
    userAddress,
    slippageTolerance = 100, // Default 0.5%
  } = params;

  const res = await checks(tokenIn, tokenOut, userAddress as `0x${string}`);

  if (!res) throw new Error("Invalid response from basic checks");

  const { allowanceData, balanceData, priceData } = res;

  console.log({
    allowanceData,
    balanceData,
    priceData,
  });

  if (!priceData.result?.path.length) throw new Error("Path Not found");

  if (!balanceData.result || balanceData.result < amountIn)
    throw new Error("Insufficient balance, top up TokenIn balance");

  if (!allowanceData.result || allowanceData.result < amountIn)
    throw new Error("Insufficient Allowance, Increase Token Approval");

  const amountOut =
    priceData.result.amounts[priceData.result.amounts.length - 1];

  const slippageBps = BigInt(slippageTolerance);
  const minAmountOut = (amountOut * (10000n - slippageBps)) / 10000n;

  if (zeroAddressCheck(tokenIn.address)) {
    const nativeswap = _swapWithNative(
      true,
      amountIn,
      minAmountOut,
      priceData.result.adapters,
      priceData.result.path,
      userAddress as `0x${string}`,
      1n
    );
    console.log("native Swap...", nativeswap);
  }

  // // Calculate minimum amount out based on slippage
  // const minAmountOut = 0n; // This should be calculated based on quote and slippage

  // return {
  //   to: routerCA,
  //   data: encodeFunctionData({
  //     abi: routerABI,
  //     functionName: "swapNoSplit",
  //     args: [
  //       tokenIn.address as `0x${string}`,
  //       tokenOut.address as `0x${string}`,
  //       amountIn,
  //       minAmountOut,
  //       userAddress as `0x${string}`,
  //       deadline,
  //     ],
  //   }),
  //   value:
  //     (tokenIn.address as string) ===
  //     "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEeEeE"
  //       ? amountIn
  //       : 0n, // ETH value if swapping ETH
  //   from: userAddress as `0x${string}`,
  // };
};

// /**
//  * Creates an unsigned swap transaction involving Natvie tokens
//  * @param params Exact input swap parameters
//  * @returns Unsigned transaction data for user to sign
//  */
// export const createNativeSwapTransaction = async (
//   params: SwapTransactionParams
// ): Promise<UnsignedTransaction> => {
//   const {
//     tokenIn,
//     tokenOut,
//     amountIn,
//     userAddress,
//     slippageTolerance = 50,
//     deadline = BigInt(Math.floor(Date.now() / 1000) + 1200),
//   } = params;

//   return {
//     to: routerCA,
//     data: encodeFunctionData({
//       abi: routerABI,
//       functionName: "swapExactTokensForTokens",
//       args: [
//         amountIn,
//         0n, // minAmountOut - should be calculated
//         [tokenIn.address as `0x${string}`, tokenOut.address as `0x${string}`],
//         userAddress as `0x${string}`,
//         deadline,
//       ],
//     }),
//     value: 0n,
//     from: userAddress as `0x${string}`,
//   };
// };
