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
  adapters: `0x${string}`[];
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
    Swap response structure
*/
export interface SwapRes {
  result?: SwapData;
  value?: SwapData;
  status: string;
}

/*
    Normal call response structure
*/
export interface ResultRes {
  result?: bigint;
  value?: bigint;
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
      swapData: SwapData;
    }
  | undefined
>;

/*
    swap transaction build structure
*/
export interface swapParams {}
