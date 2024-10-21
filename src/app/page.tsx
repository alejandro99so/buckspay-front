"use client";
import TransactionWrapper from "src/components/TransactionWrapper";
import WalletWrapper from "src/components/WalletWrapper";
import { useAccount } from "wagmi";
import LoginButton from "../components/LoginButton";
import SignupButton from "../components/SignupButton";

export default function Page() {
  const { address } = useAccount();

  return (
    <div className="flex h-full w-96 max-w-full flex-col px-1 md:w-[1008px]">
      <section className="mt-6 mb-6 flex w-full flex-col md:flex-row">
        <div className="flex w-full flex-row items-center justify-between gap-2 md:gap-0">
          <b>Buckspay</b>
          <div className="flex items-center gap-3">
            <SignupButton />
            {!address && <LoginButton />}
          </div>
        </div>
      </section>
      <section className="templateSection flex w-full flex-col items-center justify-center gap-4 rounded-xl bg-gray-100 px-2 py-4 md:grow">
        <div>Pagos fácil sin gas</div>
        {address ? (
          <TransactionWrapper
            receiver={address}
            uri={
              "https://azure-melodic-moose-223.mypinata.cloud/ipfs/bafkreig52naup6yn32la7tnlvhvje5bq22g77iseskzp6smgqurqwqxi7m"
            }
          />
        ) : (
          <WalletWrapper
            className="w-[450px] max-w-full"
            text="Sign in to transact"
          />
        )}
      </section>
    </div>
  );
}
