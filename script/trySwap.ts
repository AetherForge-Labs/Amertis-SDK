import { parseUnits } from "viem";
import { Token, swap } from "../src";

const tryChecks = async () => {
  console.log("starting...");
  const tokenIn: Token = {
    address: "0xCa9A4F46Faf5628466583486FD5ACE8AC33ce126",
    // address: "0x0000000000000000000000000000000000000000",
    decimal: 18,
    symbol: "WMON",
  };
  const tokenOut: Token = {
    // address: "0xf817257fed379853cDe0fa4F97AB987181B1E5Ea", //usdc
    address: "0x0000000000000000000000000000000000000000",
    decimal: 6,
    symbol: "USDC", // Changed to different token for testing
  };

  const res = await swap({
    amountIn: parseUnits("1.3", tokenIn.decimal),
    tokenIn,
    tokenOut,
    userAddress: "0xcC84032Cb57340044Ce5e0F29019F75C32c632b9",
  });

  console.log("The response data ", res);

  // const res = await swap({
  //   tokenIn,
  //   amountIn: parseUnits("1.3", tokenIn.decimal),
  //   tokenOut,
  //   userAddress: "0xcC84032Cb57340044Ce5e0F29019F75C32c632b9",
  // });

  // console.log("response...", res);
};

tryChecks();
