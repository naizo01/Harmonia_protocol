// グローバルなCSSをインポート
import type { AppProps } from "next/app";
import { rainbowWeb3AuthConnector } from "../components/lib/RainbowWeb3authConnectorector";
import "./globals.css";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { metaMaskWallet, rainbowWallet } from "@rainbow-me/rainbowkit/wallets";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Chain, anvil, baseSepolia, sepolia } from "viem/chains";
import { WagmiProvider } from "wagmi";

const DynamicFeeApp = ({ Component, pageProps }: AppProps) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
      },
    },
  });

  const chains = [sepolia, baseSepolia, anvil] as [Chain, ...Chain[]];

  const config = getDefaultConfig({
    appName: "dynamicFee App",
    chains: chains,
    projectId: "3a8170812b534d0ff9d794f19a901d64",
    ssr: false,
    wallets: [
      {
        groupName: "Recommended",
        wallets: [rainbowWallet, rainbowWeb3AuthConnector, metaMaskWallet],
      },
    ],
  });
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {" "}
          <Component {...pageProps} />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default DynamicFeeApp;
