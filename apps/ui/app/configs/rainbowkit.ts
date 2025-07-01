import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { anvil, zksync } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "My RainbowKit App",
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PID!,
  chains: [anvil, zksync],
  ssr: true, // If your dApp uses server side rendering (SSR)
});
