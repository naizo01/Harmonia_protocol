// hooks/useUserAttestation.ts
import { useEffect, useState } from "react";
import { useWeb3Auth } from "../pages/_app";
import { useAccount, useSignMessage } from "wagmi";

export function useUserAttestation() {
  const [stateSignData, setSignData] = useState<`0x${string}` | undefined>(undefined);
  const [message, setMessage] = useState<string>("");
  const [userInfo, setUserInfo] = useState<any>(null);
  const [isUserInfoFetched, setIsUserInfoFetched] = useState<boolean>(false);

  const { signMessage, data: signData } = useSignMessage();
  const { address } = useAccount();
  const web3AuthInstance = useWeb3Auth();

  const fetchUserInfo = async () => {
    if (web3AuthInstance?.status === "connected") {
      try {
        const userInfo = await web3AuthInstance.getUserInfo();
        console.log("User Info:", userInfo);
        setUserInfo(userInfo);
        console.log(address);
        const data = {
          discordId: userInfo.verifierId,
          communityId: "1293876618045030400",
          address: address,
          timestamp: Math.floor(Date.now() / 1000),
        };
        const messageString = JSON.stringify(data);
        signMessage({ message: messageString });
        setMessage(messageString);
      } catch (error) {
        console.error("Failed to get user info:", error);
      }
    }
  };

  const sendAttestation = async () => {
    try {
      console.log("stateSignData", stateSignData);
      const response = await fetch("http://localhost:8080/api/create-attestation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          signature: stateSignData,
          idToken: userInfo?.idToken,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const res = await response.json();
      console.log(res);
      setIsUserInfoFetched(true);
    } catch (error) {
      console.error("Failed to send attestation:", error);
    }
  };

  useEffect(() => {
    if (signData) {
      setSignData(signData);
    }
  }, [signData]);

  useEffect(() => {
    if (stateSignData) {
      sendAttestation();
    }
  }, [stateSignData]);

  useEffect(() => {
    console.log("isUserInfoFetched", isUserInfoFetched);
    if (web3AuthInstance?.status === "connected" && !isUserInfoFetched) {
      fetchUserInfo();
    }
  }, [web3AuthInstance?.status, isUserInfoFetched]);

  return {
    isUserInfoFetched,
    userInfo,
    message,
    stateSignData,
  };
}
