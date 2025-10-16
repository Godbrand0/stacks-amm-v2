"use client";

import { TransactionHistory } from "@/components/transaction-history";
import { useStacks } from "@/hooks/use-stacks";

export default function HistoryPage() {
  const { userData } = useStacks();
  const userAddress = userData?.profile?.stxAddress?.testnet || "";

  if (!userAddress) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Transaction History</h1>
        <p className="text-gray-600">
          Please connect your wallet to view transaction history
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Transaction History</h1>
      <p className="text-gray-600 mb-4">Address: {userAddress}</p>
      <TransactionHistory address={userAddress} />
    </div>
  );
}
