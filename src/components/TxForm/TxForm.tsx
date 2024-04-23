import React, { useCallback, useEffect, useState } from "react";
import ReactJson, { InteractionProps } from "react-json-view";
import "./style.scss";
import {
  SendTransactionRequest,
  useTonConnectUI,
  useTonWallet,
} from "@tonconnect/ui-react";
import { ROUTER_REVISION, ROUTER_REVISION_ADDRESS, Router } from "@ston-fi/sdk";
import TonWeb from "tonweb";

// In this example, we are using a predefined smart contract state initialization (`stateInit`)
// to interact with an "EchoContract". This contract is designed to send the value back to the sender,
// serving as a testing tool to prevent users from accidentally spending money.
const defaultTx: SendTransactionRequest = {
  // The transaction is valid for 10 minutes from now, in unix epoch seconds.
  validUntil: Math.floor(Date.now() / 1000) + 600,
  messages: [
    {
      // The receiver's address.
      address:
        "0:8a5a9c7b70d329be670de4e6cce652d464765114aa98038c66c3d8ceaf2d19b0",
      // Amount to send in nanoTON. For example, 0.005 TON is 5000000 nanoTON.
      amount: "5000000",
      // (optional) State initialization in boc base64 format.
      stateInit:
        "te6cckEBBAEAOgACATQCAQAAART/APSkE/S88sgLAwBI0wHQ0wMBcbCRW+D6QDBwgBDIywVYzxYh+gLLagHPFsmAQPsAlxCarA==",
      // (optional) Payload in boc base64 format.
      payload: "te6ccsEBAQEADAAMABQAAAAASGVsbG8hCaTc/g==",
    },

    // Uncomment the following message to send two messages in one transaction.
    /*
    {
      // Note: Funds sent to this address will not be returned back to the sender.
      address: '0:2ecf5e47d591eb67fa6c56b02b6bb1de6a530855e16ad3082eaa59859e8d5fdc',
      amount: toNano('0.01').toString(),
    }
    */
  ],
};
export const PROXY_TON_ADDRESS =
  "EQCM3B12QK1e4yZSf8GtBRT0aLMNyEsBc_DhVfRRtOEffLez";
export function TxForm() {
  const [tx, setTx] = useState(defaultTx);

  const wallet = useTonWallet();

  const [tonConnectUi] = useTonConnectUI();

  const onChange = useCallback((value: InteractionProps) => {
    setTx(value.updated_src as SendTransactionRequest);
  }, []);

  const [test, setTest] = useState();
  function uint8ArrayToBase64(uint8Array) {
    // Convert the Uint8Array to a string
    let binaryString = "";
    uint8Array.forEach((byte) => {
      binaryString += String.fromCharCode(byte);
    });

    // Convert the string to Base64
    const base64String = btoa(binaryString);
    return base64String;
  }
  const fn = async () => {
    const provider = new TonWeb.HttpProvider(
      "https://toncenter.com/api/v2/jsonRPC",
      {
        apiKey:
          "21f636b66e030c570d8a1227c87ed3cbc0c7b289858afecd3568b32a3f286f1e", // free
      }
    );
    const router = new Router(provider, {
      revision: ROUTER_REVISION.V1,
      address: ROUTER_REVISION_ADDRESS.V1,
    });

    let swapTxParams;
    const amount = "1000000000";
    const payload = {
      minAskAmount: new TonWeb.utils.BN("9276057922"),
      userWalletAddress: "UQAfgXUL5bI9do0a3XlgbqfGiUSqfNlnDh4T1ORcZHblJ0Zk",
      offerAmount: new TonWeb.utils.BN(amount),
    };

    // ton - jetton
    swapTxParams = await router.buildSwapProxyTonTxParams({
      proxyTonAddress: PROXY_TON_ADDRESS,
      askJettonAddress: "EQDUJtuWgMWnXcJX95695Esl4p77kfy6kLqtSgMo1UCAzi-6",
      ...payload,
    });

    const payload2 = uint8ArrayToBase64(await swapTxParams.payload.toBoc());
    console.log(123, payload2);

    const defaultTx: SendTransactionRequest = {
      // The transaction is valid for 10 minutes from now, in unix epoch seconds.
      validUntil: Math.floor(Date.now() / 1000) + 600,
      messages: [
        {
          // The receiver's address.
          address: swapTxParams.to.toString(),
          // Amount to send in nanoTON. For example, 0.005 TON is 5000000 nanoTON.
          amount: amount,
          // (optional) State initialization in boc base64 format.
          payload: payload2,
        },
      ],
    };
    console.log(123, swapTxParams.to.toString(), defaultTx);

    setTest(defaultTx);
  };

  useEffect(() => {
    fn();
  }, []);

  return (
    <div className="send-tx-form">
      <h3>Configure and send transaction</h3>

      <ReactJson
        theme="ocean"
        src={defaultTx}
        onEdit={onChange}
        onAdd={onChange}
        onDelete={onChange}
      />

      {wallet ? (
        <button onClick={() => tonConnectUi.sendTransaction(test)}>
          Send transaction
        </button>
      ) : (
        <button onClick={() => tonConnectUi.openModal()}>
          Connect wallet to send the transaction
        </button>
      )}
    </div>
  );
}
