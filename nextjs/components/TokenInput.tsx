// components/TokenInput.tsx
import { Token } from "../hooks/useSwapState";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Input } from "./ui/input";
import { ChevronDown } from "lucide-react";

// Token 型をインポート

type TokenInputProps = {
  tokensList: Token[];
  selectedToken: Token;
  onTokenChange: (token: Token) => void;
  amount: string;
  onAmountChange: (amount: string) => void;
  label: string;
  onMaxClick?: () => void;
};

export function TokenInput({
  tokensList,
  selectedToken,
  onTokenChange,
  amount,
  onAmountChange,
  label,
  onMaxClick,
}: TokenInputProps) {
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">{label}</div>
      <div className="flex items-center gap-2 p-4 rounded-xl bg-muted/50">
        <Input
          type="number"
          placeholder="0"
          value={amount}
          onChange={e => onAmountChange(e.target.value)}
          className="border-0 bg-transparent text-4xl"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                {selectedToken ? selectedToken.icon : "?"}
              </div>
              {selectedToken ? selectedToken.symbol : "Select"}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {tokensList.map(token => (
              <DropdownMenuItem key={token.symbol} onSelect={() => onTokenChange(token)}>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">{token.icon}</div>
                  <span>{token.name}</span>
                  <span className="text-muted-foreground">({token.symbol})</span>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="px-4 flex justify-between text-sm text-muted-foreground">
        <div>$0</div>
        <div className="flex items-center gap-1">
          <span>{selectedToken ? `${selectedToken.balance.toFixed(3)} ${selectedToken.symbol}` : "N/A"}</span>
          {onMaxClick && selectedToken && (
            <Button variant="link" className="text-pink-500 p-0 h-auto text-sm" onClick={onMaxClick}>
              Max
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default TokenInput;
