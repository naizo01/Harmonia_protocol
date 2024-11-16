// components/FeeInfo.tsx
import React from "react";
import { useActiveUserAttestation } from "../hooks/useActiveUserAttestation";

type FeeInfoProps = {
  isCommunityMember: boolean;
  isActiveUser: boolean;
  volatility: "low" | "medium" | "high";
  onAttest: () => void; // 追加: attestボタンのクリックハンドラ
};

const BASE_FEE = 5;
const ACTIVE_USER_FEE = 0.01;
const PARTICIPATION_FEE = 0.5;
export function FeeInfo({ isCommunityMember, isActiveUser, volatility, onAttest }: FeeInfoProps) {
  const calculateFee = () => {
    let fee = BASE_FEE;
    if (isCommunityMember) fee = PARTICIPATION_FEE;
    if (isActiveUser) fee = ACTIVE_USER_FEE;
    return fee;
  };

  const feeRate = calculateFee();
  const { sendActiveUserAttestation } = useActiveUserAttestation();
  return (
    <div className="space-y-2 p-4 rounded-xl bg-muted/50">
      <div className="flex justify-between items-center mb-2">
        <div className="text-sm font-medium">Swap Fee Information</div>
        {!isActiveUser && (
          <button
            onClick={() => sendActiveUserAttestation()}
            className="ml-4 px-3 py-1 text-sm text-white bg-gray-400 rounded hover:bg-gray-500"
          >
            Active user attestation
          </button>
        )}
      </div>{" "}
      <div className="flex justify-between items-center">
        <span className="text-sm">Estimated Fee Rate:</span>
        <span className="font-bold">{feeRate.toFixed(2)}%</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm">Community Member:</span>
        <span className={isCommunityMember ? "text-green-500" : "text-red-500"}>
          {isCommunityMember ? "Yes" : "No"}
        </span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm">Active User:</span>
        <span className={isActiveUser ? "text-green-500" : "text-red-500"}>{isActiveUser ? "Yes" : "No"}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm">Current Volatility:</span>
        <span
          className={
            volatility === "low" ? "text-green-500" : volatility === "medium" ? "text-yellow-500" : "text-red-500"
          }
        >
          {volatility === "low" ? "Low" : volatility === "medium" ? "Medium" : "High"}
        </span>
      </div>
    </div>
  );
}

export default FeeInfo;
