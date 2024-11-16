import type { AppProps } from "next/app";
import "./globals.css";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Chain, baseSepolia, localhost, sepolia } from "viem/chains";
import { WagmiProvider } from "wagmi";

const DynamicFeeApp = ({ Component, pageProps }: AppProps) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
      },
    },
  });

  const chains = [sepolia, baseSepolia, localhost] as [Chain, ...Chain[]];

  const config = getDefaultConfig({
    appName: "dynamicFee App",
    chains: chains,
    projectId: "3a8170812b534d0ff9d794f19a901d64",
    ssr: false,
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
