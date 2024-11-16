// components/FeeInfo.tsx
import React from "react";

type FeeInfoProps = {
  isCommunityMember: boolean;
  isActiveUser: boolean;
  volatility: "low" | "medium" | "high";
};

export function FeeInfo({ isCommunityMember, isActiveUser, volatility }: FeeInfoProps) {
  const calculateFee = () => {
    let baseFee = 0.3; // 0.3%
    if (isCommunityMember) baseFee -= 0.05;
    if (isActiveUser) baseFee -= 0.05;
    if (volatility === "high") baseFee += 0.1;
    if (volatility === "low") baseFee -= 0.05;
    return baseFee;
  };

  const feeRate = calculateFee();

  return (
    <div className="space-y-2 p-4 rounded-xl bg-muted/50">
      <div className="text-sm font-medium mb-2">Swap Fee Information</div>
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
