export interface Token {
  symbol: string;
  decimal: number;
  address: string;
}

/* 
  query result structure
*/
export interface SwapData {
  amounts: bigint[];
  adapters: string[];
  path: [];
  gasEstimate: bigint;
}

/* 
      function structure for FindBestPrice 
  */
export type FindBestPrice = (
  tokenIn: Token,
  tokenOut: Token
) => Promise<
  | {
      symbol: string;
      decimals: number;
      quote: bigint;
      formattedQuote: string;
    }
  | undefined
>;

/*
    multicall data structure
*/
export interface MultiCallRes {
  result?: SwapData;
  status: string;
}

/* 
    function structure for getAmountOut
  */
export type GetAmountOut = (
  tokenIn: Token,
  tokenOut: Token,
  amountIn: bigint
) => Promise<
  | {
      symbol: string;
      decimals: number;
      quote: bigint;
      amountOut: bigint;
      formattedAmountOut: string;
      priceData: SwapData;
    }
  | undefined
>;
