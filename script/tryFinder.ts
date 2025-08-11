import { findBestPrice, Token } from "../src";

const tryFinder = async () => {
  console.log("starting...");
  const tokenIn: Token = {
    address: "0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701",
    decimal: 18,
    symbol: "WMON",
  };
  const tokenOut: Token = {
    address: "0xf817257fed379853cDe0fa4F97AB987181B1E5Ea", //usdc
    // address: "0x912404E1945acBCB6aC57A8579D71277C6e8eA61",
    decimal: 13,
    symbol: "USDC", // Changed to different token for testing
  };

  const queryPrice = await findBestPrice(tokenIn, tokenOut);
  console.log("queryPrice...", queryPrice);
};

tryFinder();
