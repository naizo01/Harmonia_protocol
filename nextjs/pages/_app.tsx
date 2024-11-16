// グローバルなCSSをインポート
import React, { createContext, useContext } from "react";
import type { AppProps } from "next/app";
import "./globals.css";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { Wallet, WalletDetailsParams } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { metaMaskWallet, rainbowWallet } from "@rainbow-me/rainbowkit/wallets";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CHAIN_NAMESPACES, UX_MODE, WEB3AUTH_NETWORK } from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { Web3Auth } from "@web3auth/modal";
import { Web3AuthConnector } from "@web3auth/web3auth-wagmi-connector";
import { Chain, anvil, baseSepolia } from "viem/chains";
import { WagmiProvider, http } from "wagmi";
import { createConnector as createWagmiConnector } from "wagmi";

const clientId = process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID || ""; // get from https://dashboard.web3auth.io

// const chainConfig = {
//   chainNamespace: CHAIN_NAMESPACES.EIP155,
//   chainId: "0x7A69",
//   rpcTarget: "http://127.0.0.1:8545",
//   displayName: "Anvil Local",
//   ticker: "ETH",
//   tickerName: "localETH",
// };
const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: "0x14a34",
  rpcTarget: "https://sepolia.base.org",
  displayName: "Base Sepolia",
  ticker: "ETH",
  tickerName: "ETH",
};

const privateKeyProvider = new EthereumPrivateKeyProvider({ config: { chainConfig } });

const web3AuthInstance = new Web3Auth({
  clientId,
  web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
  privateKeyProvider,
  uiConfig: {
    mode: "dark",
    useLogoLoader: true,
    logoLight: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
    logoDark: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
    defaultLanguage: "en",
    theme: {
      primary: "#768729",
    },
    uxMode: UX_MODE.REDIRECT,
    modalZIndex: "2147483647",
  },
});

export const rainbowWeb3AuthConnector = (): Wallet => ({
  id: "web3auth",
  name: "Web3auth",
  rdns: "web3auth",
  iconUrl: "https://web3auth.io/images/web3authlog.png",
  iconBackground: "#fff",
  installed: true,
  downloadUrls: {},
  createConnector: (walletDetails: WalletDetailsParams) =>
    createWagmiConnector(config => ({
      ...Web3AuthConnector({
        web3AuthInstance,
      })(config),
      ...walletDetails,
    })),
});

const Web3AuthContext = createContext<Web3Auth | null>(null);

export const useWeb3Auth = () => {
  const context = useContext(Web3AuthContext);
  if (!context) {
    throw new Error("useWeb3Auth must be used within a Web3AuthProvider");
  }
  return context;
};

const DynamicFeeApp = ({ Component, pageProps }: AppProps) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
      },
    },
  });

  const chains = [baseSepolia, anvil] as [Chain, ...Chain[]];

  const config = getDefaultConfig({
    appName: "dynamicFee App",
    chains: chains,
    transports: {
      [baseSepolia.id]: http(),
      [anvil.id]: http(),
    },
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
    <Web3AuthContext.Provider value={web3AuthInstance}>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider>
            {" "}
            <Component {...pageProps} />
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </Web3AuthContext.Provider>
  );
};

export default DynamicFeeApp;
