import { routerCA, client } from "../config";
import { multicall } from "viem/actions";
import { formatUnits, parseUnits } from "viem";
import type { Abi } from "viem";
import { routerABI } from "../abi";
import type { SwapRes, GetAmountOut, Token } from "../types";
import { noSimilarToken, replaceIfZeroAddress } from "../helpers";

/**
 * @type Token
 * @notice Quote the Amertis Router for a quote
 *
 * @param tokenIn {@link Token} Type of token you wish to swap from
 * @param tokenOut {@link Token} Type of token you wish to swap to
 * @param amountIn amount of token you wish to swap
 * @returns an Object containing:
 * - symbol: Token symbol;
 * - decimal: Token Decimal:
 * - quote: The quoted output amount of the swap
 * OR "null" if no route or quote is found.
 */
export const getAmountOut: GetAmountOut = async (
  tokenIn,
  tokenOut,
  amountIn
) => {
  try {
    noSimilarToken(tokenIn, tokenOut);

    const calls = [
      {
        address: routerCA,
        abi: routerABI as Abi,
        functionName: "findBestPath",
        args: [
          parseUnits("1", tokenIn.decimal),
          replaceIfZeroAddress(tokenIn.address),
          replaceIfZeroAddress(tokenOut.address),
          4, // this is the max number of hops we use. The router expects 1 < X <= 5.
        ],
      },
      {
        address: routerCA,
        abi: routerABI,
        functionName: "findBestPath",
        args: [
          amountIn,
          replaceIfZeroAddress(tokenIn.address),
          replaceIfZeroAddress(tokenOut.address),
          4, // this is the max number of hops we use. The router expects 1 < X <= 5.
        ],
      },
    ];

    const [swapData, amountData] = (await multicall(client, {
      contracts: calls,
    })) as [SwapRes, SwapRes];

    // Type guard to check if results exist and have data
    if (
      !swapData.result ||
      !amountData.result ||
      !swapData.result.path.length ||
      !swapData.result.amounts.length ||
      !amountData.result.amounts.length
    ) {
      return undefined;
    }

    const quote = swapData.result.amounts[swapData.result.amounts.length - 1];
    const amountOut =
      amountData.result.amounts[amountData.result.amounts.length - 1];

    return {
      symbol: tokenOut.symbol,
      decimals: tokenOut.decimal,
      quote: quote,
      formattedQuote: formatUnits(quote, tokenOut.decimal),
      amountOut: amountOut,
      formattedAmountOut: formatUnits(amountOut, tokenOut.decimal),
      swapData: swapData.result,
    };
  } catch (error) {
    console.error("Error from findBestPrice", error);
  }
};
