// hooks/useSwapState.ts
import { useEffect, useState } from "react";

export type Token = {
  symbol: string;
  name: string;
  icon: string;
  balance: number;
  address: string;
};

export function useSwapState(initialTokens: Token[]) {
  // トークンの初期設定値を定義
  const [tokens, setTokens] = useState<Token[]>([initialTokens[0], initialTokens[1]]);
  const [amounts, setAmounts] = useState<string[]>(["", ""]);

  useEffect(() => {
    setTokens([initialTokens[0], initialTokens[1]]);
  }, [initialTokens]);

  const handleSwapTokens = () => {
    setTokens([tokens[1], tokens[0]]);
    setAmounts([amounts[1], amounts[0]]);
  };

  const handleMax = () => {
    setAmounts([tokens[0].balance.toString(), amounts[1]]);
  };

  const setToken = (index: number, token: Token) => {
    const newTokens = [...tokens];
    newTokens[index] = token;
    setTokens(newTokens);
  };

  const setAmount = (index: number, amount: string) => {
    const newAmounts = [...amounts];
    newAmounts[index] = amount;
    setAmounts(newAmounts);
  };

  return {
    tokens,
    amounts,
    setToken,
    setAmount,
    handleSwapTokens,
    handleMax,
    initialTokens, // initialTokens をエクスポート
  };
}
