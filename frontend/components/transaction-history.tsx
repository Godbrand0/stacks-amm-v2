"use client";

import { useEffect, useState } from "react";
import { getUserTransactionHistory, Transaction } from "@/lib/amm";

export function TransactionHistory({ address }: { address: string }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      setLoading(true);
      const history = await getUserTransactionHistory(address);
      setTransactions(history);
      setLoading(false);
    }

    if (address) {
      fetchHistory();
    }
  }, [address]);

  if (loading) {
    return <div className="text-center p-4">Loading transaction history...</div>;
  }

  if (transactions.length === 0) {
    return <div className="text-center p-4">No transactions found</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-black border border-gray-300">
        <thead>
          <tr className="">
            <th className="px-4 py-2 border">Type</th>
            <th className="px-4 py-2 border">Amount</th>
            <th className="px-4 py-2 border">Token In</th>
            <th className="px-4 py-2 border">Token Out</th>
            <th className="px-4 py-2 border">Status</th>
            <th className="px-4 py-2 border">Date</th>
            <th className="px-4 py-2 border">Transaction ID</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.txId} className="hover:bg-gray-50">
              <td className="px-4 py-2 border">{tx.type}</td>
              <td className="px-4 py-2 border">
                {(tx.amount / 1_000_000).toFixed(6)}
              </td>
              <td className="px-4 py-2 border">{tx.tokenIn}</td>
              <td className="px-4 py-2 border">{tx.tokenOut}</td>
              <td className="px-4 py-2 border">
                <span
                  className={`px-2 py-1 rounded ${
                    tx.status === "Success"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {tx.status}
                </span>
              </td>
              <td className="px-4 py-2 border">
                {new Date(tx.timestamp).toLocaleString()}
              </td>
              <td className="px-4 py-2 border font-mono text-xs">
                <a
                  href={`https://explorer.hiro.so/txid/${tx.txId}?chain=testnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {tx.txId.substring(0, 8)}...
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
