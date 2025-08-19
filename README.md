# Amertis SDK

A TypeScript/JavaScript SDK for interacting with Amertis' on-chain aggregator Router. Provides efficient token swaps, approvals, and transaction management.

## 🚀 Features

- **🔄 Smart Routing**: Find optimal swap paths with best prices
- **💰 Gas Optimization**: Minimize gas costs with efficient routing
- **🔐 Secure Transactions**: Users manage their own keys, SDK provides transaction data
- **📱 Universal Support**: Works with any wallet (MetaMask, Ledger, WalletConnect, etc.)

## 📦 Installation

```bash
pnpm add amertis-sdk
# or
yarn add amertis-sdk
# or
npm install amertis-sdk
```

## 🔧 Quick Start

```typescript
import { findBestPrice, getAmountOut, swap } from "amertis-sdk";

// Get best price quote
const quote = await findBestPrice(tokenIn, tokenOut);

// Calculate expected output amount for a given input amount
const amountOut = await getAmountOut(tokenIn, tokenOut, parseUnits("100", tokenIn.decimal);

// Create an UNSIGNED swap transaction data
const swapTx = await swap({
  tokenIn,
  tokenOut,
  amountIn: parseUnits("100", tokenIn.decimals),
  userAddress: "0x...",
  // slippage, it defaults to 0.1% (10 bps) if not specified.
});
```

## 📚 API Reference

### Read Functions

#### `findBestPrice(tokenIn: Token, tokenOut: Token)`

Find the best swap route and price between two tokens.

```typescript
const tokenIn: Token = {
  address: "0x...USDC", // Token to swap from
  decimal: 6,
  symbol: "USDC",
};

const tokenOut: Token = {
  address: "0x...WMON", // Token to swap to
  decimal: 18,
  symbol: "WMON",
};

const quote = await findBestPrice(tokenIn, tokenOut);

if (quote) {
  console.log(`Best price: ${quote.formattedQuote} ${quote.symbol}`);
  console.log(`Amount out: ${quote.quote}`);
}
```

#### `getAmountOut(tokenIn: Token, tokenOut: Token, amountIn: bigint)`

Calculate the expected output amount for a given input amount.

```typescript
const amountOut = await getAmountOut(tokenIn, tokenOut, parseUnits("100", tokenIn.decimal);

if (amountOut) {
  console.log(`Input: 100 ${tokenIn.symbol}`);
  console.log(`Output: ${amountOut.formattedAmountOut} ${tokenOut.symbol}`);
  console.log(`Quote: ${amountOut.formattedQuote} ${tokenOut.symbol}`);
}
```

### Write Functions

#### `swap(params: SwapTransactionParams)`

Create an unsigned swap transaction.

```typescript
const swapTx = await swap({
  tokenIn,
  tokenOut,
  amountIn: parseUnits("100", tokenIn.decimal),
  userAddress: "0x1234...",
  slippageTolerance: 10, // 0.1%
});

// swapTx contains:
// {
//   to: '0x...',
//   data: '0x...',
//   value: 0n,
//   from: '0x1234...'
// }

//  You can then SIGN and submit the swap transaction using any of your preferred method
```

## 📋 Type Definitions

### Core Types

```typescript
interface Token {
  symbol: string;
  decimal: number;
  address: string;
}

interface SwapTransactionParams {
  tokenIn: Token;
  tokenOut: Token;
  amountIn: bigint;
  userAddress: string;
  slippageTolerance?: number; // Default: 100 (1%)
}

interface UnsignedTransaction {
  to: string;
  data: string;
  value: bigint;
  from: string;
}
```

### Function Types

```typescript
// READ types

type FindBestPrice = (
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

type GetAmountOut = (
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

// WRITE types and Intefaces

interface SwapTransactionParams {
  tokenIn: Token;
  tokenOut: Token;
  amountIn: bigint;
  userAddress: string;
  slippageTolerance?: number; // in basis points (e.g., 10 = 0.1%)
}

interface UnsignedTransaction {
  to: string;
  data: string;
  value: bigint;
  from: string;
}

type swap = (
  params: SwapTransactionParams
) => Promise<UnsignedTransaction | undefined>;
```

## ⚠️ Important Notes

### Native Token (MON)

- **Use `"0x0000000000000000000000000000000000000000"` (zero address) for native token**
- When swapping **from native token**: Set `tokenIn.address = "0x0000..."`
- When swapping **to native token**: Set `tokenOut.address = "0x0000..."`

### Transaction Flow

1. **Get Quote**: Use `findBestPrice()` to get quote price only or `getAmountOut()` to get quotePrice, expected Output Amount and SwapData
2. **Create Transaction**: Use `swap()` to create unsigned transaction
3. **User Signs**: User signs transaction with their wallet
4. **Submit**: User submits signed transaction to network

### Slippage Tolerance

- Default slippage is **1%** (100 basis points)
- Set `slippageTolerance: 50` for **0.5%**
- Set `slippageTolerance: 200` for **2%**

## 🛠️ Development

### Building from Source

```bash
git clone <repository>
cd amertis-sdk
pnpm install
pnpm build
```

### Development Mode

```bash
pnpm start  # Watch mode with auto-rebuild
```

## 📄 License

ISC License

## 🆘 Support

- **GitHub Issues**: [Report a bug](https://github.com/AetherForge-Labs/Amertis-SDK/issues)
- **Author**: [@defilova1](https://x.com/defilova1)

---

**Made with ❤️ by the Amertis Team**
