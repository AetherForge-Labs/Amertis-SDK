import { parseUnits } from "viem";
import { Token } from "../src";
import { swap } from "../src";
import { checks, NativeChecks } from "../src/helpers";

const tryChecks = async () => {
  console.log("starting...");
  const tokenIn: Token = {
    // address: "0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701", //wmon
    address: "0x0000000000000000000000000000000000000000",
    decimal: 18,
    symbol: "WMON",
  };
  const tokenOut: Token = {
    address: "0xf817257fed379853cDe0fa4F97AB987181B1E5Ea", //usdc
    // address: "0x0000000000000000000000000000000000000000",
    decimal: 6,
    symbol: "USDC", // Changed to different token for testing
  };

  const res = await NativeChecks(
    tokenIn,
    tokenOut,
    "0xcC84032Cb57340044Ce5e0F29019F75C32c632b9"
  );

  console.log("response...", res?.priceData.value);

  // const res = await swap({
  //   tokenIn,
  //   amountIn: parseUnits("1.3", tokenIn.decimal),
  //   tokenOut,
  //   userAddress: "0xcC84032Cb57340044Ce5e0F29019F75C32c632b9",
  // });

  // console.log("response...", res);
};

tryChecks();
