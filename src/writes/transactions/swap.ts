import { encodeFunctionData } from "viem";
import { routerCA } from "../../config";
import { routerABI } from "../../abi";
import type { Token } from "../../types";

export interface SwapTransactionParams {
  tokenIn: Token;
  tokenOut: Token;
  amountIn: bigint;
  userAddress: string;
  slippageTolerance?: number; // in basis points (e.g., 50 = 0.5%)
  deadline?: bigint;
}

export interface UnsignedTransaction {
  to: `0x${string}`;
  data: `0x${string}`;
  value: bigint;
  from: `0x${string}`;
}

/**
 * Creates an unsigned ExactTokenToTokens swap transaction
 * @param params Swap parameters
 * @returns Unsigned transaction data for user to sign
 */
export const createSwapTransaction = async (
  params: SwapTransactionParams
): Promise<UnsignedTransaction> => {
  const {
    tokenIn,
    tokenOut,
    amountIn,
    userAddress,
    slippageTolerance = 50, // Default 0.5%
    deadline = BigInt(Math.floor(Date.now() / 1000) + 1200), // Default 20 minutes
  } = params;

  // Calculate minimum amount out based on slippage
  const minAmountOut = 0n; // This should be calculated based on quote and slippage

  return {
    to: routerCA,
    data: encodeFunctionData({
      abi: routerABI,
      functionName: "swap",
      args: [
        tokenIn.address as `0x${string}`,
        tokenOut.address as `0x${string}`,
        amountIn,
        minAmountOut,
        userAddress as `0x${string}`,
        deadline,
      ],
    }),
    value:
      (tokenIn.address as string) ===
      "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEeEeE"
        ? amountIn
        : 0n, // ETH value if swapping ETH
    from: userAddress as `0x${string}`,
  };
};

/**
 * Creates an unsigned swap transaction involving Natvie tokens
 * @param params Exact input swap parameters
 * @returns Unsigned transaction data for user to sign
 */
export const createNativeSwapTransaction = async (
  params: SwapTransactionParams
): Promise<UnsignedTransaction> => {
  const {
    tokenIn,
    tokenOut,
    amountIn,
    userAddress,
    slippageTolerance = 50,
    deadline = BigInt(Math.floor(Date.now() / 1000) + 1200),
  } = params;

  return {
    to: routerCA,
    data: encodeFunctionData({
      abi: routerABI,
      functionName: "swapExactTokensForTokens",
      args: [
        amountIn,
        0n, // minAmountOut - should be calculated
        [tokenIn.address as `0x${string}`, tokenOut.address as `0x${string}`],
        userAddress as `0x${string}`,
        deadline,
      ],
    }),
    value: 0n,
    from: userAddress as `0x${string}`,
  };
};
