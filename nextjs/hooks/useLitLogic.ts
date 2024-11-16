import { useEffect } from "react";
import { useRouter } from "next/router";
import { useLitContext } from "../context/LitContext";
import useAccounts from "../hooks/useAccounts";
import useAuthenticate from "../hooks/useAuthenticate";
import useSession from "../hooks/useSession";
import { useWeb3Auth } from "../pages/_app";
import { ORIGIN, signInWithDiscord, signInWithGoogle } from "../utils/lit";
import { AuthMethodType } from "@lit-protocol/constants";
import { useDisconnect } from "wagmi";

export function useLitLogic() {
  const web3AuthInstance = useWeb3Auth();
  const redirectUri = ORIGIN;

  const {
    authMethod,
    authWithEthWallet,
    authWithWebAuthn,
    authWithStytch,
    loading: authLoading,
    error: authError,
  } = useAuthenticate(redirectUri);

  const {
    createAccount,
    setCurrentAccount: setAccount,
    currentAccount,
    loading: accountsLoading,
    error: accountsError,
  } = useAccounts();

  const { initSession, sessionSigs, loading: sessionLoading, error: sessionError } = useSession();

  const router = useRouter();
  const { disconnectAsync } = useDisconnect();

  const { setCurrentAccount, setSessionSigs } = useLitContext();

  const error = authError || accountsError || sessionError;

  useEffect(() => {
    if (authMethod && authMethod.authMethodType !== AuthMethodType.WebAuthn) {
      router.replace(window.location.pathname, undefined, { shallow: true });
      createAccount(authMethod);
    }
  }, [authMethod, createAccount]);

  useEffect(() => {
    if (authMethod && currentAccount) {
      initSession(authMethod, currentAccount);
      setCurrentAccount(currentAccount); // コンテキストにcurrentAccountをセット
    }
  }, [authMethod, currentAccount, initSession, setCurrentAccount]);

  useEffect(() => {
    if (sessionSigs) {
      setSessionSigs(sessionSigs); // コンテキストにsessionSigsをセット
    }
  }, [sessionSigs, setSessionSigs]);

  const handleGoogleLogin = async () => {
    await signInWithGoogle(redirectUri);
  };

  const handleDiscordLogin = async () => {
    await signInWithDiscord(redirectUri);
  };

  const handleLogout = async () => {
    try {
      await disconnectAsync();
    } catch (err) {}
    localStorage.removeItem("lit-wallet-sig");
    router.reload();
  };

  const truncateEthAddress = (address: string) => {
    const truncateRegex = /^(0x[a-zA-Z0-9]{4})[a-zA-Z0-9]+([a-zA-Z0-9]{4})$/;
    const match = address.match(truncateRegex);
    if (!match) return address;
    return `${match[1]}…${match[2]}`;
  };

  return {
    web3AuthInstance,
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
  };
}
