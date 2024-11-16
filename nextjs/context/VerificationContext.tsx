import React, { ReactNode, createContext, useContext, useState } from "react";

export type VerificationData = {
  activeAttestId: bigint;
  activeIsActive: boolean;
  communityAttestId: bigint;
  communityIsMember: boolean;
};

type VerificationContextType = {
  verificationData: VerificationData;
  setVerificationData: React.Dispatch<React.SetStateAction<VerificationData>>;
};

const VerificationContext = createContext<VerificationContextType | undefined>(undefined);

export const VerificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [verificationData, setVerificationData] = useState<VerificationData>({
    activeAttestId: BigInt(0),
    activeIsActive: false,
    communityAttestId: BigInt(0),
    communityIsMember: false,
  });

  return (
    <VerificationContext.Provider value={{ verificationData, setVerificationData }}>
      {children}
    </VerificationContext.Provider>
  );
};

export const useVerificationContext = (): VerificationContextType => {
  const context = useContext(VerificationContext);
  if (!context) {
    throw new Error("useVerificationContext must be used within a VerificationProvider");
  }
  return context;
};
