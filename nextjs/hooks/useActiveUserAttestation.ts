import { useState } from "react";
import { useLitContext } from "../context/LitContext";
import { communityId, roleId } from "../lib/constants/config"
import { litNodeClient } from "~~/utils/lit";
import { PKPEthersWallet } from "@lit-protocol/pkp-ethers";
import { useVerificationContext } from "../context/VerificationContext";

export function useActiveUserAttestation() {
  const { ethAddress, accessToken: litAccessToken, currentAccount, sessionSigs, decryptionMetadata } = useLitContext();
  const [isAttestationSent, setIsAttestationSent] = useState(false);
  const { verificationData, setVerificationData } = useVerificationContext();

  const sendActiveUserAttestation = async () => {
    try {
      const idToken = ethAddress ? litAccessToken : null;
      if (currentAccount && sessionSigs) {

        const message = {
          discordId: decryptionMetadata.ciphertext,
          communityId: communityId,
          roleId: roleId,
          address: ethAddress,
          timestamp: 0,
          indexingValue: decryptionMetadata.dataToEncryptHash
        }

        // メッセージをJSON文字列に変換
        const messageString = JSON.stringify(message);

        await litNodeClient.connect();

        const pkpWallet = new PKPEthersWallet({
          controllerSessionSigs: sessionSigs,
          pkpPubKey: currentAccount.publicKey,
          litNodeClient: litNodeClient,
        });

        await pkpWallet.init();

        // 文字列化されたメッセージを渡す
        const signature = await pkpWallet.signMessage(messageString);
        const response = await fetch("http://localhost:8080/api/create-attestation/active", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: messageString,
            signature,
            idToken: litAccessToken,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const res = await response.json();
        console.log("Attestation response:", res);
        setIsAttestationSent(true);
        setVerificationData({
          activeAttestId: res.attestationId,
          activeIsActive: true,
          communityAttestId: verificationData.communityAttestId,
          communityIsMember: verificationData.communityIsMember,
      });      }
    } catch (error) {
      console.error("Failed to send active user attestation:", error);
    }
  };

  return {
    isAttestationSent,
    sendActiveUserAttestation,
  };
}