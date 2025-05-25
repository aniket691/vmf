import React, { useState, useEffect } from "react";

const STATUS_STYLES = {
  Completed: "text-green-600 bg-green-100",
  Pending: "text-yellow-600 bg-yellow-100",
  Rejected: "text-red-600 bg-red-100",
};

const RequestHistory = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");

  // Fetch request history from API
  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("http://localhost:3000/wallet_request", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error(`Error: ${res.status}`);
        }

        const data = await res.json();
        setRequests(data);
      } catch (err) {
        setError(err.message || "Failed to load requests");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [token]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <h1 className="text-3xl font-bold text-blue-700 mb-8">Request History</h1>

      {loading && <p className="text-blue-600">Loading...</p>}

      {error && <p className="text-red-600 font-semibold">{error}</p>}

      {!loading && !error && (
        <div className="overflow-x-auto w-full max-w-6xl bg-white rounded-2xl shadow-lg p-6">
          <table className="min-w-full table-auto border-collapse border border-gray-300 text-left">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="px-5 py-3 border border-blue-700">Account Number</th>
                <th className="px-5 py-3 border border-blue-700">IFSC Code</th>
                <th className="px-5 py-3 border border-blue-700">Amount (₹)</th>
                <th className="px-5 py-3 border border-blue-700">Requested On</th>
                <th className="px-5 py-3 border border-blue-700">Status</th>
                <th className="px-5 py-3 border border-blue-700">Sent Date</th>
              </tr>
            </thead>

            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-400 font-medium">
                    No requests found.
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr
                    key={req.id}
                    className="hover:bg-gray-100 transition-colors duration-150"
                  >
                    <td className="px-5 py-3 border border-gray-300">{req.account_number}</td>
                    <td className="px-5 py-3 border border-gray-300">{req.ifsc_code}</td>
                    <td className="px-5 py-3 border border-gray-300 font-semibold text-blue-700">
                      ₹ {req.requested_amount}
                    </td>
                    <td className="px-5 py-3 border border-gray-300">{formatDate(req.requested_amount_date)}</td>
                    <td className="px-5 py-3 border border-gray-300">
                      <span
                        className={`inline-block px-3 py-1 rounded-full font-semibold text-sm ${
                          STATUS_STYLES[req.status] || "text-gray-600 bg-gray-200"
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 border border-gray-300">{formatDate(req.sent_amount_date)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RequestHistory;
