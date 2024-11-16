import React, { createContext, useContext, useState } from "react";
import { IRelayPKP, SessionSigs } from "@lit-protocol/types";

type LitContextType = {
  currentAccount: IRelayPKP | undefined;
  sessionSigs: SessionSigs | null;
  setCurrentAccount: React.Dispatch<React.SetStateAction<IRelayPKP | undefined>>;
  setSessionSigs: React.Dispatch<React.SetStateAction<SessionSigs | null>>;
  litUserInfo: any;
  setLitUserInfo: React.Dispatch<React.SetStateAction<any>>;
  defaultChainId: number;
  ethAddress: string | undefined;
  accessToken: string | null;
  setAccessToken: React.Dispatch<React.SetStateAction<string | null>>;
  decryptionMetadata: any;
  setDecryptionMetadata: React.Dispatch<React.SetStateAction<any>>;
};

const LitContext = createContext<LitContextType | undefined>(undefined);

export const LitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const defaultChainId = Number(process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID) || Number(0);
  const [currentAccount, setCurrentAccount] = useState<IRelayPKP | undefined>(undefined);
  const [sessionSigs, setSessionSigs] = useState<SessionSigs | null>(null);
  const [litUserInfo, setLitUserInfo] = useState<any | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [decryptionMetadata, setDecryptionMetadata] = useState<any>(null);

  const ethAddress = currentAccount?.ethAddress;

  return (
    <LitContext.Provider
      value={{
        currentAccount,
        sessionSigs,
        setCurrentAccount,
        setSessionSigs,
        defaultChainId,
        ethAddress,
        litUserInfo,
        setLitUserInfo,
        accessToken,
        setAccessToken,
        decryptionMetadata,
        setDecryptionMetadata,
      }}
    >
      {children}
    </LitContext.Provider>
  );
};

export const useLitContext = () => {
  const context = useContext(LitContext);
  if (!context) {
    throw new Error("useLitContext must be used within a LitProvider");
  }
  return context;
};
