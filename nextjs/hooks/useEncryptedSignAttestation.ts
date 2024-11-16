import { useState } from "react";
import { useLitContext } from "../context/LitContext";
import * as LitJsSdk from "@lit-protocol/lit-node-client";
import {EncryptStringRequest} from "@lit-protocol/types";

export const useEncryptedSignAttestation = () => {
    const { client, sessionSigs } = useLitContext();

    const encryptAttestation = async (attestationData: any) => {
        try {
            // Basic EVM access control conditions
            const accessControlConditions = [
                {
                    contractAddress: '',
                    standardContractType: '',
                    chain: 'ethereum',
                    method: '',
                    parameters: [],
                    returnValueTest: {
                        comparator: '=',
                        value: 'PKP_PUBLIC_KEY' // Discord Bot用のPKP
                    }
                }
            ];

            // 暗号化パラメータの準備
            const encryptParams: EncryptStringRequest = {
                dataToEncrypt: discordId,
                accessControlConditions,
                chain: 'ethereum'
            };

            const { encryptedString, symmetricKey } = await LitJsSdk.encryptString(
                encryptParams,
                client
            );

            // 暗号化キーの保存
            const encryptedSymmetricKey = await client.saveEncryptionKey({
                accessControlConditions,
                symmetricKey,
                authSig: sessionSigs,
                chain: 'ethereum'
            });

            return {
                encryptedString,
                encryptedSymmetricKey,
                accessControlConditions
            };
        } catch (error) {
            console.error("Error encrypting attestation:", error);
            throw error;
        }
    };

    // 復号化関数
    const decryptAttestation = async (
        encryptedString: string,
        encryptedSymmetricKey: string,
        accessControlConditions: any
    ) => {
        try {
            const symmetricKey = await client.getEncryptionKey({
                accessControlConditions,
                toDecrypt: encryptedSymmetricKey,
                authSig: sessionSigs,
                chain: 'ethereum'
            });

            const decryptedString = await LitJsSdk.decryptString(
                encryptedString,
                symmetricKey
            );

            return JSON.parse(decryptedString);
        } catch (error) {
            console.error("Error decrypting attestation:", error);
            throw error;
        }
    };

    return {
        encryptAttestation,
        decryptAttestation
    };
};
