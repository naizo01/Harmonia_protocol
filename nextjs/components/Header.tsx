// components/Header.tsx
import { Button } from "./ui/button";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ChevronDown } from "lucide-react";

export function Header() {
  return (
    <header className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-8">
        {/* ロゴ部分 */}
        <div className="flex items-center gap-2">
          <div className="text-pink-500 text-2xl font-bold">◊</div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </div>
        {/* ナビゲーションメニュー */}
        <nav className="flex items-center gap-8">
          <Button variant="ghost" className="font-semibold">
            Trade
          </Button>
          <Button variant="ghost" className="text-muted-foreground">
            Explore
          </Button>
          <Button variant="ghost" className="text-muted-foreground">
            Pool
          </Button>
        </nav>
      </div>
      {/* ウォレット接続ボタン */}
      <div className="flex items-center gap-2">
        <ConnectButton />
      </div>
    </header>
  );
}

export default Header;
