import Loading from "../components/Loading";
import { useLitContext } from "../context/LitContext";
import { useLitLogic } from "../hooks/useLitLogic";
import { LitAuthMethods } from "./LitAuthMethods";
import { Button } from "./ui/button";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ChevronDown } from "lucide-react";
import { useAccount, useChainId } from "wagmi";
import { config } from "~~/lib/constants/config";

export function Header() {
  let chainId = useChainId();
  const { address } = useAccount();
  const { ethAddress, defaultChainId } = useLitContext();
  chainId = ethAddress ? defaultChainId : chainId;

  const {
    authLoading,
    accountsLoading,
    sessionLoading,
    error,
    currentAccount,
    sessionSigs,
    handleGoogleLogin,
    handleDiscordLogin,
    handleLogout,
    truncateEthAddress,
  } = useLitLogic();
  const isLoading = authLoading || accountsLoading || sessionLoading;
  const scanUrl = config[chainId].scan;
  return (
    <header className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2">
          <div className="text-pink-500 text-2xl font-bold">◊</div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </div>
        <nav className="flex items-center gap-8">
          <Button variant="ghost" className="font-semibold">
            Swap
          </Button>
          <Button variant="ghost" className="text-muted-foreground">
            Explore
          </Button>
          <Button variant="ghost" className="text-muted-foreground">
            Pool
          </Button>
        </nav>
      </div>
      {currentAccount && sessionSigs ? (
        <div className="flex items-center gap-2 p-1 bg-white shadow-md rounded-lg">
          <div className="details-card flex flex-col items-start">
            <p className="text-xs text-gray-500">PKP Address:</p>
            <a
              href={`${scanUrl}address/${currentAccount.ethAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-md font-semibold text-blue-500 hover:underline"
            >
              {truncateEthAddress(currentAccount.ethAddress.toLowerCase())}
            </a>
          </div>
          <button
            className="btn btn--link text-white bg-blue-300 hover:bg-blue-300 transition-colors duration-300 rounded-full px-4 py-2"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          {!isLoading && <ConnectButton />}
          {!isLoading && !address && (
            <LitAuthMethods handleGoogleLogin={handleGoogleLogin} handleDiscordLogin={handleDiscordLogin} />
          )}
          {isLoading && <Loading copy={"Loading..."} error={error} />}
        </div>
      )}
    </header>
  );
}

export default Header;
