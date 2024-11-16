import { UniswapDesktop } from "../components/UniswapDesktop";
import { LitProvider } from "../context/LitContext";
import { VerificationProvider } from "../context/VerificationContext";

const Home = () => {
  return (
    <LitProvider>
      <VerificationProvider>
        <UniswapDesktop />
      </VerificationProvider>
    </LitProvider>
  );
};

export default Home;
