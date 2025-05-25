import React, { useState, useEffect } from "react";
import axios from "axios";

export default function WalletHistoryC() {
  const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const [walletHistory, setWalletHistory] = useState([]);
  const [filter, setFilter] = useState("All"); // CREDIT, DEBIT, All
  const [sortAsc, setSortAsc] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchWalletHistory = async () => {
      setLoading(true);
      setErrorMsg("");
      try {
        const token = localStorage.getItem("token") || "";
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const { data: txs = [] } = await axios.get(
          `${API}/wallet/transactions`,
          { headers }
        );
        setWalletHistory(txs);
      } catch (err) {
        if (err.response?.status === 401) {
          setErrorMsg("⚠️ Session expired. Please log in again.");
        } else {
          setErrorMsg(
            "Failed to load wallet history. Please try again later."
          );
          console.error("WalletHistory fetch error:", err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchWalletHistory();
  }, [API]);

  const filteredRecords = walletHistory.filter((record) =>
    filter === "All" ? true : record.type === filter
  );

  const sortedRecords = filteredRecords.sort((a, b) => {
    const dateA = new Date(a.createdAt || a.created_at);
    const dateB = new Date(b.createdAt || b.created_at);
    return sortAsc ? dateA - dateB : dateB - dateA;
  });

  return (
    <div className="ml-[250px] flex flex-col items-center min-h-screen p-6 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
        Wallet Transactions
      </h1>

      {loading && (
        <div className="mb-4 text-gray-700 dark:text-gray-300 font-semibold">
          Loading wallet history...
        </div>
      )}
      {errorMsg && (
        <div className="mb-4 text-red-600 font-semibold">{errorMsg}</div>
      )}

      <div className="flex space-x-4 mb-6">
        {["All", "CREDIT", "DEBIT"].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded-md font-semibold 
              ${filter === type
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="flex justify-end mb-4">
        <button
          onClick={() => setSortAsc(!sortAsc)}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
          aria-label="Sort by date"
          title="Sort by date"
        >
          <span>Sort by Date</span>
          <svg
            className={`w-4 h-4 transform ${sortAsc ? "rotate-180" : "rotate-0"}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7"></path>
          </svg>
        </button>
      </div>

      <div className="overflow-x-auto w-full max-w-6xl">
        <table className="min-w-full bg-white dark:bg-gray-800">
          <thead>
            <tr>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">ID</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Merchant Order ID</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Transaction ID</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Type</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Amount</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Date</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Payment Details</th>
            </tr>
          </thead>
          <tbody>
            {!loading && sortedRecords.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-6 text-gray-500 dark:text-gray-400">
                  No transactions found for "{filter}".
                </td>
              </tr>
            ) : (
              sortedRecords.map((tx) => (
                <tr key={tx.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{tx.id}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{tx.merchantOrderId || '-'}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{tx.transactionId || '-'}</td>
                  <td className="py-3 px-4 font-semibold text-sm text-gray-800 dark:text-gray-100">{tx.type}</td>
                  <td className="py-3 px-4 font-semibold text-sm text-gray-800 dark:text-gray-100">₹{Number(tx.amount).toFixed(2)}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{tx.status}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{new Date(tx.createdAt).toLocaleString()}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300 break-words max-w-xs">
                    {tx.paymentDetails ? JSON.stringify(tx.paymentDetails) : '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}