# Amertis SDK

A comprehensive TypeScript/JavaScript SDK for interacting with the Amertis' fully on-chain aggregator Router. Enter providing efficient token swaps, approvals, and transaction management.

## 🚀 Features

- **🔄 Smart Routing**: Find optimal swap paths with best prices
- **💰 Gas Optimization**: Minimize gas costs with efficient routing
- **🔐 Secure Transactions**: Users manage their own keys, SDK provides transaction data
- **📱 Universal Support**: Works with any wallet (MetaMask, Ledger, WalletConnect, etc.)
- **⚡ Batch Operations**: Execute multiple transactions efficientl
- **📊 Real-time Quotes**: Get live pricing and swap estimates
- **🛡️ Permit Support**: Gasless approvals for compatible tokens

## 📦 Installation

```bash
npm install Amertis-SDK
# or
yarn add Amertis-SDK
# or
pnpm add Amertis-SDK
```

## 🔧 Quick Start

### Basic Setup

```typescript
import {
  findBestPrice,
  createApproveTransaction,
  createSwapTransaction,
} from "Amertis-SDK";

// Get best price quote
const quote = await findBestPrice(tokenIn, tokenOut);

// Create approval transaction
const approveTx = await createApproveTransaction({
  tokenAddress: "0x...",
  amount: parseEther("100"),
  userAddress: "0x...",
});

// Create swap transaction
const swapTx = await createSwapTransaction({
  tokenIn,
  tokenOut,
  amountIn: parseEther("100"),
  userAddress: "0x...",
});
```

## 📚 API Reference

### Read Functions

#### `findBestPrice(tokenIn: Token, tokenOut: Token)`

Find the best swap route and price between two tokens.

```typescript
import { findBestPrice } from "Amertis-SDK";

const tokenIn: Token = {
  address: "0xA0b86a33E6441b4c",
  decimal: 6,
  symbol: "USDC",
};

const tokenOut: Token = {
  address: "0x6B175474E89094C44",
  decimal: 18,
  symbol: "DAI",
};

const quote = await findBestPrice(tokenIn, tokenOut);

if (quote) {
  console.log(`Best price: ${quote.formattedQuote} ${quote.symbol}`);
  console.log(`Amount out: ${quote.quote}`);
  console.log(`Path: ${quote.path}`);
}
```

#### `getAmountOut(tokenIn: Token, tokenOut: Token, amountIn: bigint)`

Calculate the exact output amount for a given input amount.

```typescript
import { getAmountOut } from "Amertis-SDK";

const amountOut = await getAmountOut(tokenIn, tokenOut, parseEther("100"));

if (amountOut) {
  console.log(`Input: 100 ${tokenIn.symbol}`);
  console.log(`Output: ${amountOut.formattedAmountOut} ${tokenOut.symbol}`);
  console.log(`Quote: ${amountOut.formattedQuote} ${tokenOut.symbol}`);
}
```

### Write Functions (Transaction Builders)

#### `createApproveTransaction(params: ApproveTransactionParams)`

Create an unsigned approval transaction for the router.

```typescript
import { createApproveTransaction } from "Amertis-SDK";

const approveTx = await createApproveTransaction({
  tokenAddress: "0xA0b86a33E6441b4c", // USDC
  amount: parseUnits("1000", 6),
  userAddress: "0x1234...",
});

// approveTx contains:
// {
//   to: '0xA0b86a33E6441b4c',
//   data: '0x...',
//   value: 0n,
//   from: '0x1234...'
// }
```

#### `createPermitTransaction(params: PermitTransactionParams)`

Create a gasless permit transaction (if token supports EIP-2612).

```typescript
import { createPermitTransaction } from "Amertis-SDK";

const permitTx = await createPermitTransaction({
  tokenAddress: "0xA0b86a33E6441b4c",
  amount: parseUnits("1000", 6),
  userAddress: "0x1234...",
  deadline: BigInt(Math.floor(Date.now() / 1000) + 1200), // 20 minutes
  v: 27,
  r: "0x...",
  s: "0x...",
});
```

#### `createSwapTransaction(params: SwapTransactionParams)`

Create an unsigned swap transaction.

```typescript
import { createSwapTransaction } from "Amertis-SDK";

const swapTx = await createSwapTransaction({
  tokenIn,
  tokenOut,
  amountIn: parseEther("100"),
  userAddress: "0x1234...",
  slippageTolerance: 50, // 0.5%
  deadline: BigInt(Math.floor(Date.now() / 1000) + 1200),
});
```

#### `createExactInputSwapTransaction(params: SwapTransactionParams)`

Create an exact input swap transaction.

```typescript
import { createExactInputSwapTransaction } from "Amertis-SDK";

const exactInputTx = await createExactInputSwapTransaction({
  tokenIn,
  tokenOut,
  amountIn: parseEther("100"),
  userAddress: "0x1234...",
  slippageTolerance: 100, // 1%
  deadline: BigInt(Math.floor(Date.now() / 1000) + 1800), // 30 minutes
});
```

### Execution Functions

#### `executeTransaction(params: ExecuteTransactionParams)`

Execute a transaction using a private key (for users who want your service to execute).

```typescript
import { executeTransaction } from "Amertis-SDK";

const result = await executeTransaction({
  transaction: swapTx,
  privateKey: "0x...",
  waitForConfirmation: true,
});

if (result.success) {
  console.log(`Transaction hash: ${result.hash}`);
  console.log(`Gas used: ${result.receipt?.gasUsed}`);
} else {
  console.error(`Transaction failed: ${result.error}`);
}
```

#### `executeBatchTransactions(transactions: UnsignedTransaction[], privateKey: string, waitForConfirmation?: boolean)`

Execute multiple transactions in sequence.

```typescript
import { executeBatchTransactions } from "Amertis-SDK";

const results = await executeBatchTransactions(
  [approveTx, swapTx],
  "0x...",
  true
);

results.forEach((result, index) => {
  if (result.success) {
    console.log(`Transaction ${index + 1} succeeded: ${result.hash}`);
  } else {
    console.error(`Transaction ${index + 1} failed: ${result.error}`);
  }
});
```

## 🏗️ Architecture

### Transaction Flow

1. **Quote Generation**: Use read functions to get best prices and routes
2. **Transaction Building**: Create unsigned transactions with your SDK
3. **User Signing**: Users sign transactions with their preferred wallet
4. **Execution**: Users submit signed transactions or use your execution service

### Security Model

- **🔐 User Key Management**: Users always control their private keys
- **📝 Transaction Building**: SDK only provides transaction data, never executes
- **✅ Optional Execution**: Users can choose to execute through your service
- **🛡️ No Key Exposure**: Your service never sees user private keys

## 💰 Supported Tokens

### Standard ERC-20 Support

- All ERC-20 tokens with standard interface
- Automatic approval and transfer functionality

### EIP-2612 Permit Support

- **USDC** - Gasless approvals
- **USDT** - Gasless approvals
- **DAI** - Gasless approvals
- **WETH** - Gasless approvals
- **Most modern DeFi tokens**

## 🌐 Network Support

- **Monad Testnet** - Primary development network
- **Ethereum Mainnet** - Production ready
- **Polygon** - Layer 2 scaling
- **Arbitrum** - High-performance L2
- **Optimism** - Fast and cheap transactions

## 🔌 Wallet Integration

### MetaMask

```typescript
import { createWalletClient, custom } from "viem";

const walletClient = createWalletClient({
  transport: custom(window.ethereum),
});

// Sign transaction
const signedTx = await walletClient.signTransaction(transaction);
```

### WalletConnect

```typescript
import { createWalletClient, custom } from "viem";

const walletClient = createWalletClient({
  transport: custom(walletConnectProvider),
});
```

### Hardware Wallets

```typescript
// Ledger, Trezor, etc.
const walletClient = createWalletClient({
  transport: custom(hardwareWalletProvider),
});
```

## 📱 Usage Examples

### Frontend Application

```typescript
import { findBestPrice, createSwapTransaction } from "Amertis-SDK";
import { signTransaction, sendTransaction } from "viem/actions";

const performSwap = async () => {
  try {
    // 1. Get quote
    const quote = await findBestPrice(tokenIn, tokenOut);
    if (!quote) throw new Error("No route found");

    // 2. Create swap transaction
    const swapTx = await createSwapTransaction({
      tokenIn,
      tokenOut,
      amountIn: parseEther("100"),
      userAddress: userAddress,
    });

    // 3. User signs transaction
    const signedTx = await signTransaction({
      transaction: swapTx,
      privateKey: userPrivateKey,
    });

    // 4. Submit to network
    const hash = await sendTransaction(client, { transaction: signedTx });

    console.log(`Swap submitted: ${hash}`);
  } catch (error) {
    console.error("Swap failed:", error);
  }
};
```

### Backend Service

```typescript
import { createApproveTransaction, executeTransaction } from "Amertis-SDK";

const processApproval = async (req, res) => {
  try {
    const { tokenAddress, amount, userAddress, privateKey } = req.body;

    // 1. Create approval transaction
    const approveTx = await createApproveTransaction({
      tokenAddress,
      amount,
      userAddress,
    });

    // 2. Execute for user
    const result = await executeTransaction({
      transaction: approveTx,
      privateKey,
      waitForConfirmation: true,
    });

    if (result.success) {
      res.json({
        success: true,
        hash: result.hash,
        message: "Approval successful",
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
```

### Batch Operations

```typescript
import {
  createApproveTransaction,
  createSwapTransaction,
  executeBatchTransactions,
} from "Amertis-SDK";

const performBatchSwap = async () => {
  // 1. Create multiple transactions
  const approveTx = await createApproveTransaction({
    tokenAddress: "0x...",
    amount: parseEther("1000"),
    userAddress: "0x...",
  });

  const swapTx = await createSwapTransaction({
    tokenIn,
    tokenOut,
    amountIn: parseEther("1000"),
    userAddress: "0x...",
  });

  // 2. Execute batch
  const results = await executeBatchTransactions(
    [approveTx, swapTx],
    privateKey,
    true
  );

  return results;
};
```

## 🛠️ Development

### Building from Source

```bash
git clone https://github.com/your-org/amertis-sdk.git
cd amertis-sdk
pnpm install
pnpm build
```

### Running Tests

```bash
pnpm test
```

### Development Mode

```bash
pnpm dev
```

## 📋 Type Definitions

### Core Types

```typescript
interface Token {
  symbol: string;
  decimal: number;
  address: string;
}

interface UnsignedTransaction {
  to: `0x${string}`;
  data: `0x${string}`;
  value: bigint;
  from: `0x${string}`;
}

interface SwapTransactionParams {
  tokenIn: Token;
  tokenOut: Token;
  amountIn: bigint;
  userAddress: string;
  slippageTolerance?: number;
  deadline?: bigint;
}
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.amertis.com](https://docs.amertis.com)
- **Discord**: [discord.gg/amertis](https://discord.gg/amertis)
- **Email**: support@amertis.exchange
- **GitHub Issues**: [Report a bug](https://github.com/your-org/amertis-sdk/issues)

## 🔗 Links

- **Website**: [amertis.com](https://amertis.exchange)
- **GitHub**: [github.com/your-org/amertis-sdk](https://github.com/your-org/amertis-sdk)

## 🙏 Acknowledgments

- Built with [viem](https://viem.sh/) for robust Ethereum interactions
- Inspired by leading DEX aggregators
- Community-driven development and feedback

---

**Made with ❤️ by the Amertis Team**
