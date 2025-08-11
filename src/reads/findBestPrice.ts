import { routerCA, client } from "../config";
import { readContract } from "viem/actions";
import { formatUnits, parseUnits } from "viem";
import type { Abi } from "viem";
import abi from "../abi";
import type { FindBestPrice, SwapData, Token } from "../types";

// Remove local client creation - now using shared client

/**
 * @type Token
 * @notice Quote the Amertis Router for a quote
 *
 * @param tokenIn {@link Token} Type of token you wish to swap from
 * @param tokenOut {@link Token} Type of token you wish to swap to
 * @returns an Object containing:
 * - symbol: Token symbol;
 * - decimal: Token Decimal:
 * - quote: The quoted output amount of the swap
 * OR "null" if no route or quote is found.
 */
export const findBestPrice: FindBestPrice = async (tokenIn, tokenOut) => {
  try {
    const res = await readContract(client, {
      address: routerCA as `0x${string}`,
      abi: abi as Abi,
      functionName: "findBestPath",
      args: [
        parseUnits("1", tokenIn.decimal),
        tokenIn.address as `0x${string}`,
        tokenOut.address as `0x${string}`,
        4, // this is the max number of hops we use. The router expects 1 < X <= 5.
      ],
    });
    const { amounts, path } = res as SwapData;
    if (!path.length || !amounts.length)
      throw new Error("No route found between the specified tokens");
    const quote = amounts[amounts.length - 1];
    return {
      symbol: tokenOut.symbol,
      decimals: tokenOut.decimal,
      quote,
      formattedQuote: formatUnits(quote, tokenOut.decimal),
    };
  } catch (error) {
    console.log("Error from findBestPrice", error);
  }
};
