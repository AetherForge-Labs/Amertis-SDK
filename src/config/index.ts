import { createPublicClient, http } from "viem";
import { monadTestnet } from "viem/chains";

export const routerCA: `0x${string}` =
  "0xD158Cb79C63F4852485E37F05D20da3093d143Ed";

export const wrappedNative: `0x${string}` =
  "0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701";

const viemClient = (isTestnet: boolean) =>
  createPublicClient({
    transport: http(),
    chain: isTestnet ? monadTestnet : monadTestnet, // will be defaulted To mainnet when the need arises
  });

export const client = viemClient(true);
