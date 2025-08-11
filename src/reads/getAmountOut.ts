import { routerCA, client } from "../config";
import { multicall } from "viem/actions";
import { formatUnits, parseUnits } from "viem";
import type { Abi } from "viem";
import abi from "../abi";
import type { MultiCallRes, GetAmountOut, SwapData, Token } from "../types";

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
    const calls = [
      {
        address: routerCA as `0x${string}`,
        abi: abi as Abi,
        functionName: "findBestPath",
        args: [
          parseUnits("1", tokenIn.decimal),
          tokenIn.address as `0x${string}`,
          tokenOut.address as `0x${string}`,
          4, // this is the max number of hops we use. The router expects 1 < X <= 5.
        ],
      },
      {
        address: routerCA as `0x${string}`,
        abi: abi as Abi,
        functionName: "findBestPath",
        args: [
          amountIn,
          tokenIn.address as `0x${string}`,
          tokenOut.address as `0x${string}`,
          4, // this is the max number of hops we use. The router expects 1 < X <= 5.
        ],
      },
    ];

    const [priceData, amountData] = (await multicall(client, {
      contracts: calls,
    })) as [MultiCallRes, MultiCallRes];

    // Type guard to check if results exist and have data
    if (
      !priceData.result ||
      !amountData.result ||
      !priceData.result.path.length ||
      !priceData.result.amounts.length ||
      !amountData.result.amounts.length
    ) {
      throw new Error("No route found between the specified tokens");
    }

    const quote = priceData.result.amounts[priceData.result.amounts.length - 1];
    const amountOut =
      amountData.result.amounts[amountData.result.amounts.length - 1];

    return {
      symbol: tokenOut.symbol,
      decimals: tokenOut.decimal,
      quote: quote,
      formattedQuote: formatUnits(quote, tokenIn.decimal),
      amountOut: amountOut,
      formattedAmountOut: formatUnits(amountOut, tokenOut.decimal),
      priceData: priceData.result,
    };
  } catch (error) {
    console.log("Error from findBestPrice", error);
  }
};
