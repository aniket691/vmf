// import { useEffect, useState } from "react";

// const RequestedMoney = () => {
//   const [requests, setRequests] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [editingId, setEditingId] = useState(null);
//   const [newStatus, setNewStatus] = useState("");

//   useEffect(() => {
//     fetchRequests();
//   }, []);

//   const fetchRequests = () => {
//     const token = localStorage.getItem("token");
//     if (!token) {
//       setError("Authentication token not found.");
//       setLoading(false);
//       return;
//     }

//     fetch("http://localhost:3000/wallet_request", {
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//     })
//       .then(res => res.json())
//       .then(data => {
//         setRequests(Array.isArray(data) ? data : []);
//         setLoading(false);
//       })
//       .catch(err => {
//         console.error("Fetch error:", err);
//         setError("Failed to fetch wallet request data.");
//         setLoading(false);
//       });
//   };

//   const handleStatusClick = (id, currentStatus) => {
//     setEditingId(id);
//     setNewStatus(currentStatus);
//   };

//   const handleStatusChange = (e) => {
//     setNewStatus(e.target.value);
//   };

//   const handleStatusUpdate = async (id) => {
//     const token = localStorage.getItem("token");

//     try {
//       const res = await fetch(`http://localhost:3000/wallet_request/${id}`, {
//         method: "PATCH",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({ status: newStatus }),
//       });

//       if (!res.ok) {
//         throw new Error("Failed to update status");
//       }

//       setEditingId(null);
//       fetchRequests(); // Refresh list
//     } catch (err) {
//       console.error(err);
//       alert("Failed to update status");
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 pl-64 pr-4 pt-8">
//       <div className="max-w-7xl mx-auto bg-white p-6 rounded-lg shadow">
//         <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center">
//           Requested Money - Distributor List
//         </h2>

//         {loading && <p className="text-center text-gray-500">Loading data...</p>}
//         {error && <p className="text-center text-red-500">{error}</p>}

//         {!loading && !error && (
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-blue-600 text-white">
//                 <tr>
//                   <th className="px-4 py-3 text-left">#</th>
//                   <th className="px-4 py-3 text-left">Account No</th>
//                   <th className="px-4 py-3 text-left">IFSC</th>
//                   <th className="px-4 py-3 text-left">Requested Amount</th>
//                   <th className="px-4 py-3 text-left">Request Date</th>
//                   {/* <th className="px-4 py-3 text-left">Sent Date</th> */}
//                   <th className="px-4 py-3 text-left">Status</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-100">
//                 {requests.map((req, index) => (
//                   <tr key={req.id} className="hover:bg-gray-50">
//                     <td className="px-4 py-2">{index + 1}</td>
//                     <td className="px-4 py-2">{req.account_number}</td>
//                     <td className="px-4 py-2">{req.ifsc_code}</td>
//                     <td className="px-4 py-2 font-semibold text-blue-700">₹ {req.requested_amount}</td>
//                     <td className="px-4 py-2">{req.requested_amount_date}</td>
//                     {/* <td className="px-4 py-2">{req.sent_amount_date || "-"}</td> */}
//                     <td className="px-4 py-2">
//                       {editingId === req.id ? (
//                         <div className="flex items-center gap-2">
//                           <select
//                             value={newStatus}
//                             onChange={handleStatusChange}
//                             className="border border-gray-300 rounded px-2 py-1 text-sm"
//                           >
//                             {[
//                               "Pending",
//                               "Approved",
//                               "Rejected",
//                               "Uploaded",
//                               "Completed",
//                               "Sent",
//                               "Received",
//                             ].map((status) => (
//                               <option key={status} value={status}>
//                                 {status}
//                               </option>
//                             ))}
//                           </select>
//                           <button
//                             onClick={() => handleStatusUpdate(req.id)}
//                             className="bg-green-500 text-white px-2 py-1 rounded text-xs"
//                           >
//                             Save
//                           </button>
//                         </div>
//                       ) : (
//                         <span
//                           className="text-blue-600 cursor-pointer hover:underline"
//                           onClick={() => handleStatusClick(req.id, req.status)}
//                         >
//                           {req.status}
//                         </span>
//                       )}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default RequestedMoney;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const RequestedMoney = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Authentication token not found.");
      setLoading(false);
      return;
    }

    fetch("http://localhost:3000/wallet_request", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        setRequests(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Fetch error:", err);
        setError("Failed to fetch wallet request data.");
        setLoading(false);
      });
  };

  const handleSendMoney = (request) => {
    navigate(`/send-money/${request.id}`, { state: request });
  };

  return (
    <div className="min-h-screen bg-gray-100 pl-64 pr-4 pt-8">
      <div className="max-w-7xl mx-auto bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center">
          Requested Money - Distributor List
        </h2>

        {loading && <p className="text-center text-gray-500">Loading data...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="px-4 py-3 text-left">#</th>
                  <th className="px-4 py-3 text-left">Account No</th>
                  <th className="px-4 py-3 text-left">IFSC</th>
                  <th className="px-4 py-3 text-left">Requested Amount</th>
                  <th className="px-4 py-3 text-left">Request Date</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {requests.map((req, index) => (
                  <tr key={req.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2">{index + 1}</td>
                    <td className="px-4 py-2">{req.account_number}</td>
                    <td className="px-4 py-2">{req.ifsc_code}</td>
                    <td className="px-4 py-2 font-semibold text-blue-700">₹ {req.requested_amount}</td>
                    <td className="px-4 py-2">{req.requested_amount_date}</td>
                    <td className="px-4 py-2">
                      {editingId === req.id ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={newStatus}
                            onChange={handleStatusChange}
                            className="border border-gray-300 rounded px-2 py-1 text-sm"
                          >
                            {["Pending", "Approved", "Rejected", "Uploaded", "Completed", "Sent", "Received"].map((status) => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleStatusUpdate(req.id)}
                            className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <span
                          className="text-blue-600 cursor-pointer hover:underline"
                          onClick={() => handleStatusClick(req.id, req.status)}
                        >
                          {req.status}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => handleSendMoney(req)}
                        className="bg-indigo-500 text-white px-3 py-1 rounded text-xs hover:bg-indigo-600"
                      >
                        Send Money
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestedMoney;
