import { routerCA, client, wrappedNative } from "../config";
import { readContract } from "viem/actions";
import { formatUnits, parseUnits } from "viem";
import { routerABI } from "../abi";
import type { FindBestPrice, SwapData, Token } from "../types";
import { noSimilarToken, replaceIfZeroAddress } from "../helpers";

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
    noSimilarToken(tokenIn, tokenOut);

    const res = await readContract(client, {
      address: routerCA as `0x${string}`,
      abi: routerABI,
      functionName: "findBestPath",
      args: [
        parseUnits("1", tokenIn.decimal),
        replaceIfZeroAddress(tokenIn.address),
        replaceIfZeroAddress(tokenOut.address),
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
