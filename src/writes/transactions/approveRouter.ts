import { encodeFunctionData } from "viem";
import { routerCA } from "../../config";
import { erc20ABI } from "../../abi";

export interface ApproveTransactionParams {
  tokenAddress: string;
  amount: bigint;
  userAddress: string;
}

export interface UnsignedTransaction {
  to: `0x${string}`;
  data: `0x${string}`;
  value: bigint;
  from: `0x${string}`;
}

/**
 * Creates an unsigned approval transaction for the router
 * @param params Approval parameters
 * @returns Unsigned transaction data for user to sign
 */
export const createApproveTransaction = async (
  params: ApproveTransactionParams
): Promise<UnsignedTransaction> => {
  const { tokenAddress, amount, userAddress } = params;

  return {
    to: tokenAddress as `0x${string}`,
    data: encodeFunctionData({
      abi: erc20ABI,
      functionName: "approve",
      args: [routerCA, amount],
    }),
    value: 0n,
    from: userAddress as `0x${string}`,
  };
};

/**
 * Creates an unsigned permit transaction (if token supports it)
 * @param params Permit parameters including VRS values
 * @returns Unsigned transaction data for user to sign
 */
export const createPermitTransaction = async (
  params: ApproveTransactionParams & {
    deadline: bigint;
    v: number;
    r: `0x${string}`;
    s: `0x${string}`;
  }
): Promise<UnsignedTransaction> => {
  const { tokenAddress, amount, userAddress, deadline, v, r, s } = params;

  return {
    to: tokenAddress as `0x${string}`,
    data: encodeFunctionData({
      abi: erc20ABI,
      functionName: "permit",
      args: [userAddress, routerCA, amount, deadline, v, r, s],
    }),
    value: 0n,
    from: userAddress as `0x${string}`,
  };
};
