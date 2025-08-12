import { parseUnits, zeroAddress } from "viem";
import { getAmountOut, Token } from "../src";

const tryAmount = async () => {
  console.log("starting...");
  const tokenIn: Token = {
    // address: "0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701", //wmon
    address: zeroAddress,
    decimal: 18,
    symbol: "WMON",
  };
  const tokenOut: Token = {
    address: "0xf817257fed379853cDe0fa4F97AB987181B1E5Ea", //usdc
    // address: "0x912404E1945acBCB6aC57A8579D71277C6e8eA61",
    // address: zeroAddress,
    decimal: 6,
    symbol: "USDC", // Changed to different token for testing
  };

  const queryPrice = await getAmountOut(
    tokenIn,
    tokenOut,
    parseUnits("25", tokenIn.decimal)
  );
  console.log("queryPrice...", queryPrice);
};

tryAmount();
