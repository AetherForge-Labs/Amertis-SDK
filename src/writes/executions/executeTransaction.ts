import { client } from "../../config";
import { sendTransaction, waitForTransactionReceipt } from "viem/actions";
import type { UnsignedTransaction } from "../transactions";
import { privateKeyToAccount } from "viem/accounts";

export interface ExecuteTransactionParams {
  transaction: UnsignedTransaction;
  privateKey: `0x${string}`;
  waitForConfirmation?: boolean;
}

export interface ExecuteTransactionResult {
  hash: `0x${string}`;
  receipt?: any;
  success: boolean;
  error?: string;
}

/**
 * Executes a transaction using the provided private key
 * Note: This is for users who want to execute through your service
 * Most users should sign and submit transactions themselves
 */
export const executeTransaction = async (
  params: ExecuteTransactionParams
): Promise<ExecuteTransactionResult> => {
  try {
    const { transaction, privateKey, waitForConfirmation = false } = params;

    // Send the transaction with correct parameter structure
    const hash = await sendTransaction(client, {
      account: privateKeyToAccount(privateKey),
      to: transaction.to,
      data: transaction.data,
      value: transaction.value,
    });

    let receipt;
    if (waitForConfirmation) {
      receipt = await waitForTransactionReceipt(client, { hash });
    }

    return {
      hash,
      receipt,
      success: true,
    };
  } catch (error) {
    return {
      hash: "0x" as `0x${string}`,
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

/**
 * Batch execute multiple transactions
 */
export const executeBatchTransactions = async (
  transactions: UnsignedTransaction[],
  privateKey: `0x${string}`,
  waitForConfirmation = false
): Promise<ExecuteTransactionResult[]> => {
  const results: ExecuteTransactionResult[] = [];

  for (const transaction of transactions) {
    const result = await executeTransaction({
      transaction,
      privateKey,
      waitForConfirmation,
    });
    results.push(result);
  }

  return results;
};
