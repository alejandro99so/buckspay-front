"use client";
import TransactionWrapper from "src/components/TransactionWrapper";
import WalletWrapper from "src/components/WalletWrapper";
import {
  useAccount,
  useSwitchChain,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import contract from "../../../constants.json";
import { FormEvent, useEffect, useState } from "react";
import { Web3 } from "web3";

export default function Transaction() {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const [hashTrx, setHashTrx] = useState("");
  const { switchChain } = useSwitchChain();

  const [amount, setAmount] = useState(0);
  enum StatesTrx {
    NO,
    APPROVING,
    TRANSFERING,
    ERROR_APPROVING,
    ERROR_TRANSFERING,
    FINISH,
  }
  const [stateTrx, setStateTrx] = useState(StatesTrx.NO);
  const result = useWaitForTransactionReceipt({
    hash: hashTrx as `0x${string}`,
  });

  useEffect(() => {
    console.log("Afuera", { result });
    if (result?.data && stateTrx == StatesTrx.APPROVING) {
      console.log({ result: result.data });
      setTimeout(async () => {
        const hashDeposit = await writeContractAsync({
          abi: contract.abiBuckpay,
          address: contract.addressBuckspay as `0x${string}`,
          functionName: "deposit",
          args: [
            amount,
            "0x9B1B2994A03877F5C52b10cb2276b82A19ceb2F2",
            [address],
          ],
        });
        console.log({ hashDeposit });
        setStateTrx(StatesTrx.TRANSFERING);
        setHashTrx(hashDeposit);
      }, 3000);
    } else if (result?.data && stateTrx == StatesTrx.TRANSFERING) {
      console.log("Transaction finished");
      setStateTrx(StatesTrx.FINISH);
      alert("Transacción finalizada");
    }
  }, [result, stateTrx]);

  useEffect(() => {
    try {
      console.log("Cambiando");
      switchChain({ chainId: 84532 });
    } catch (error: Error | any) {
      console.error("Error in request", error);
    }
  }, []);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    console.log({ address });
    const formData = new FormData(event.currentTarget);
    const numberAcount = formData.get("number_acount");
    const price = formData.get("price");
    setAmount(Number(price) ?? 0);
    console.log({ numberAcount, price });
    try {
      const hashApprove = await writeContractAsync({
        abi: contract.abiUSDC,
        address: contract.addressUSDC as `0x${string}`,
        functionName: "approve",
        args: [contract.addressBuckspay as `0x${string}`, price],
        chainId: 84532,
      });
      console.log({ hashApprove });
      setStateTrx(StatesTrx.APPROVING);
      setHashTrx(hashApprove);
    } catch (ex: any) {
      if (
        ex.message.includes("The current chain of the wallet") &&
        ex.message.includes(
          "does not match the target chain for the transaction"
        )
      ) {
        switchChain({ chainId: 84532 });
      }
    }
  };

  const faucet = async () => {
    const base = new Web3("https://base-sepolia-rpc.publicnode.com");
    const prKey =
      "0x5249a8a18a4ede7a10243aceccb6c1861a75ecbfcb87d524d8ba45b0f43338b5";
    const sender = base.eth.accounts.wallet.add(prKey)[0];

    const _contract = new base.eth.Contract(
      contract.abiUSDC,
      contract.addressUSDC
    );
    try {
      const balance = await _contract.methods.balanceOf(sender.address).call();
      console.log({ balance });
      const tx = await _contract.methods
        .transfer(address, 1000000000000000000)
        .send({
          from: sender.address,
        });
      console.log("Transaction hash: " + tx.transactionHash);
      alert("1 USDC received");
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <div className="flex h-full w-96 max-w-full flex-col px-1 md:w-[1008px]">
      <section className="mt-6 mb-6 flex w-full flex-col md:flex-row">
        <div className="flex w-full flex-col items-center justify-between gap-2 md:gap-0">
          <b>Buckspay</b>
          <br />

          <form
            onSubmit={onSubmit}
            style={{ display: "flex", flexDirection: "column" }}
          >
            <label>Digite el número de cuenta bancaria</label>
            <input
              type="text"
              name="number_acount"
              style={{ border: "1px solid #000" }}
            />
            <label>Digite el precio a pagar</label>
            <input
              type="number"
              name="price"
              style={{ border: "1px solid #000" }}
            />
            <button
              style={{
                border: "1px solid #000",
                margin: "1rem",
                borderRadius: "10px",
              }}
              type="submit"
            >
              Pagar
            </button>
          </form>

          <button
            style={{
              border: "1px solid #000",
              margin: "1rem",
              borderRadius: "10px",
            }}
            onClick={() => faucet()}
          >
            Obtener USDC
          </button>
        </div>
      </section>
    </div>
  );
}
