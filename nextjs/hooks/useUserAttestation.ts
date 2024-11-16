// hooks/useUserAttestation.ts
import {useEffect, useState} from "react";
import {useLitContext} from "../context/LitContext";
import {useWeb3Auth} from "../pages/_app";
import {PKPEthersWallet} from "@lit-protocol/pkp-ethers";
import {useAccount, useSignMessage} from "wagmi";
import {litNodeClient} from "~~/utils/lit";
import * as LitJsSdk from "@lit-protocol/lit-node-client";
import {AccessControlConditions, EncryptStringRequest} from "@lit-protocol/types";
import {communityId } from "../lib/constants/config"
import { useVerificationContext } from "../context/VerificationContext";

export type VerificationData = {
    activeAttestId: bigint;
    activeIsActive: boolean;
    communityAttestId: bigint;
    communityIsMember: boolean;
};

export async function fetchVerificationData(indexingValue: string): Promise<VerificationData> {
    try {
        const response = await fetch(`http://localhost:8080/api/verify/${indexingValue}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
        const res = await response.json();
        console.log(res);

        const communityIsMember = res.community.isMember;
        const communityAttestId = communityIsMember ? BigInt(res.community.attestId) : BigInt(0);
        const activeIsActive = res.active.isActive;
        const activeAttestId = activeIsActive ? BigInt(res.active.attestIds[0]) : BigInt(0);

        return {
            activeAttestId,
            activeIsActive,
            communityAttestId,
            communityIsMember,
        };
    } catch (error) {
        console.error("fetchVerificationData error", error);
        return {
            activeAttestId: BigInt(0),
            activeIsActive: false,
            communityAttestId: BigInt(0),
            communityIsMember: false,
        };
    }
}

export function useUserAttestation() {
    const [stateSignData, setSignData] = useState<`0x${string}` | undefined>(undefined);
    const [message, setMessage] = useState<string>("");
    const [userInfo, setUserInfo] = useState<any>(null);
    const [isUserInfoFetched, setIsUserInfoFetched] = useState<boolean>(false);
    const [litSignData, setLitSignData] = useState<string | undefined>(undefined);
    // const [decryptionMetadata, setDecryptionMetadata] = useState<any>(null);
    const { verificationData, setVerificationData } = useVerificationContext();

    // const [verificationData, setVerificationData] = useState<VerificationData>({
    //     activeAttestId: BigInt(0),
    //     activeIsActive: false,
    //     communityAttestId: BigInt(0),
    //     communityIsMember: false,
    // });
    const {litUserInfo, ethAddress, currentAccount, sessionSigs, accessToken: litAccessToken, setDecryptionMetadata } = useLitContext();
    const {signMessage, data: signData} = useSignMessage();
    const {address} = useAccount();
    const web3AuthInstance = useWeb3Auth();

    const fetchUserInfo = async () => {
        if (web3AuthInstance?.status === "connected") {
            try {
                const userInfo = await web3AuthInstance.getUserInfo();
                console.log("User Info:", userInfo);
                setUserInfo(userInfo);
            } catch (error) {
                console.error("Failed to get user info:", error);
            }
        }
    };

    const signUserMessage = async () => {
        if (userInfo && address) {
            const verifyData = await fetchVerificationData(userInfo?.verifierId || "");
            setVerificationData(verifyData);
            if (verifyData.communityIsMember) return;
            const data = {
                discordId: userInfo.verifierId,
                communityId: communityId,
                address: address,
                timestamp: Math.floor(Date.now() / 1000),
                indexingValue: userInfo.verifierId,
            };
            const messageString = JSON.stringify(data);
            signMessage({message: messageString});
            setMessage(messageString);
        }
    };

    const litSignUserMessage = async () => {
        const accessControlConditions: AccessControlConditions = [
            {
                contractAddress: "",
                standardContractType: "",
                chain: "ethereum",
                method: "eth_getBalance",
                parameters: [":userAddress", "latest"],
                returnValueTest: {
                    comparator: ">=",
                    value: "1000000000000",
                },
            },
        ];

        const encryptParams: EncryptStringRequest = {
            accessControlConditions,
            dataToEncrypt: litUserInfo.id,
            chain: 'ethereum'
        };
        const {ciphertext, dataToEncryptHash} = await LitJsSdk.encryptString(
          encryptParams,
          litNodeClient
        );
        const decryptionMetadata = {
            ciphertext,
            dataToEncryptHash,
            accessControlConditions
        };
        setDecryptionMetadata(decryptionMetadata);

        const verifyData = await fetchVerificationData(dataToEncryptHash || "");
        setVerificationData(verifyData);
        if (verifyData.communityIsMember) return;
        console.log("litSignUserMessage", currentAccount)
        console.log("sessionSigs", sessionSigs)
        if (currentAccount && sessionSigs) {
            const data = {
                discordId: ciphertext,
                communityId: "1293876618045030400",
                address: ethAddress,
                timestamp: Math.floor(Date.now() / 1000),
                indexingValue: dataToEncryptHash,
            };

            const messageString = JSON.stringify(data);
            await litNodeClient.connect();

            const pkpWallet = new PKPEthersWallet({
                controllerSessionSigs: sessionSigs,
                pkpPubKey: currentAccount.publicKey,
                litNodeClient: litNodeClient,
            });

            await pkpWallet.init();

            const signature = await pkpWallet.signMessage(messageString);
            console.log("signature", signature);
            setLitSignData(signature);
            setMessage(messageString);
        }
    };

    const sendAttestation = async () => {
        try {
            console.log("stateSignData", stateSignData);
            console.log("litSignData", litSignData)
            console.log("message", message)
            console.log(JSON.stringify({
                message,
                signature: litSignData ? litSignData : stateSignData,
                idToken: ethAddress ? litAccessToken : userInfo?.idToken,
            }))
            const response = await fetch("http://localhost:8080/api/create-attestation", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message,
                    signature: litSignData ? litSignData : stateSignData,
                    idToken: ethAddress ? litAccessToken : userInfo?.idToken,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const res = await response.json();
            console.log(res);
            // const verifyData = await fetchVerificationData(ethAddress ? litUserInfo?.id : userInfo?.verifierId || "");
            setVerificationData({
                activeAttestId: BigInt(0),
                activeIsActive: false,
                communityAttestId: res.attestationId,
                communityIsMember: true,
            });
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
        if (litSignData) {
            // setLitSignData(litSignData as `0x${string}`);
            sendAttestation();
        }
    }, [litSignData]);

    useEffect(() => {
        if (stateSignData) {
            sendAttestation();
        }
    }, [stateSignData]);

    useEffect(() => {
        if (web3AuthInstance?.status === "connected") {
            fetchUserInfo();
        }
    }, [web3AuthInstance?.status]);

    useEffect(() => {
        if (!isUserInfoFetched && userInfo && userInfo?.typeOfLogin === "discord") {
            signUserMessage();
        }
    }, [userInfo]);

    useEffect(() => {
        if (litUserInfo && currentAccount && sessionSigs) {
            litSignUserMessage();
        }
    }, [litUserInfo, currentAccount, sessionSigs]);

    return {
        isUserInfoFetched,
        userInfo,
    };
}
