// components/SwapForm.tsx
import { Token } from "../hooks/useSwapState";
import { TokenInput } from "./TokenInput";
import { Button } from "./ui/button";
import { ArrowUpDown } from "lucide-react";
import { Settings } from "lucide-react";

// Token 型をインポート

type SwapFormProps = {
  tokensList: Token[];
  tokens: Token[];
  setToken: (index: number, token: Token) => void;
  amounts: string[];
  setAmount: (index: number, amount: string) => void;
  onSwapTokens: () => void;
  onMaxClick: () => void;
};

export function SwapForm({
  tokensList,
  tokens,
  setToken,
  amounts,
  setAmount,
  onSwapTokens,
  onMaxClick,
}: SwapFormProps) {
  return (
    <>
      <div className="p-3 flex justify-between items-center border-b">
        <div className="font-semibold mx-4">Swap</div>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
      </div>
      <div className="p-4 space-y-2">
        <TokenInput
          tokensList={tokensList}
          selectedToken={tokens[0]}
          onTokenChange={token => setToken(0, token)}
          amount={amounts[0]}
          onAmountChange={amount => setAmount(0, amount)}
          label="Sell"
          onMaxClick={onMaxClick}
        />

        <div className="flex justify-center -my-1">
          <Button variant="ghost" size="icon" className="rounded-full bg-muted z-10" onClick={onSwapTokens}>
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>

        <TokenInput
          tokensList={tokensList}
          selectedToken={tokens[1]}
          onTokenChange={token => setToken(1, token)}
          amount={amounts[1]}
          onAmountChange={amount => setAmount(1, amount)}
          label="Buy"
        />
      </div>
    </>
  );
}

export default SwapForm;
