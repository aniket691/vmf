import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaRegFileAlt,
  FaDownload,
  FaFileInvoice,
  FaCheck,
  FaTimes,
} from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";

const ElistPage = () => {
  const [distributors, setDistributors] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const { categoryId, subcategoryId } = location.state || {};

  useEffect(() => {
    axios
      .get("http://localhost:3000/documents/list")
      .then((response) => {
        const sortedDocuments = response.data.documents.sort(
          (a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at)
        );
        setDocuments(sortedDocuments);
      })
      .catch((error) => console.error("Error fetching documents:", error));

    axios
      .get("http://localhost:3000/users/distributors")
      .then((response) => setDistributors(response.data))
      .catch((error) => console.error("Error fetching distributors:", error));

    axios
      .get("http://localhost:3000/certificates")
      .then((response) => setCertificates(response.data))
      .catch((error) => console.error("Error fetching certificates:", error));

    axios
      .get("http://localhost:3000/users/register")
      .then((response) => setUsers(response.data))
      .catch((error) => console.error("Error fetching users:", error));
  }, []);

  const handleStatusFilterChange = (e) => setStatusFilter(e.target.value);
  const handleSearch = (e) => setSearchQuery(e.target.value);

  const filteredDocuments = documents
    .filter((doc) => {
      if (categoryId && doc.category_id !== categoryId) return false;
      if (subcategoryId && doc.subcategory_id !== subcategoryId) return false;
      return true;
    })
    .filter((doc) =>
      statusFilter
        ? doc.status?.toLowerCase() === statusFilter.toLowerCase()
        : true
    )
    .filter((doc) => {
      if (!searchQuery) return true;
      const lowerQuery = searchQuery.toLowerCase();
      return (
        doc.document_id?.toString().toLowerCase().includes(lowerQuery) ||
        doc.name?.toLowerCase().includes(lowerQuery) ||
        doc.email?.toLowerCase().includes(lowerQuery) ||
        doc.phone?.toString().toLowerCase().includes(lowerQuery) ||
        doc.category_name?.toLowerCase().includes(lowerQuery) ||
        doc.subcategory_name?.toLowerCase().includes(lowerQuery) ||
        doc.address?.toLowerCase().includes(lowerQuery)
      );
    });

  const getDistributorName = (distributorId) => {
    const distributor = users.find(
      (user) => Number(user.user_id) === Number(distributorId)
    );
    return distributor ? distributor.name : "";
  };

  const handleViewInvoice = (documentId, categoryId, subcategoryId) => {
    navigate(`/Invoice/${documentId}`, {
      state: { categoryId, subcategoryId },
    });
  };

  const handleView = (documentId, categoryId, subcategoryId) => {
    navigate(`/View/${documentId}`, { state: { categoryId, subcategoryId } });
  };

  const getCertificateByDocumentId = (documentId) => {
    const matchedCertificate = certificates.find(
      (cert) => cert.document_id === documentId
    );
    return matchedCertificate ? matchedCertificate.certificate_id : null;
  };

  const handleDownloadReceipt = (receiptUrl, documentName) => {
    try {
      const fileExtension = receiptUrl.split(".").pop().toLowerCase();
      const fileName = `${documentName}_receipt.${fileExtension}`;
      const link = document.createElement("a");
      link.href = receiptUrl;
      link.download = fileName;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading receipt:", error);
      alert("Failed to download receipt. Please try again.");
    }
  };

  const handleViewCertificate = async (documentId) => {
    const certificateId = getCertificateByDocumentId(documentId);
    if (!certificateId) return alert("Certificate not found.");
    try {
      const response = await axios.get(
        `http://localhost:3000/certificates/${certificateId}`
      );
      if (response.data?.file_url) {
        window.open(response.data.file_url, "_blank");
      } else {
        alert("Certificate not found.");
      }
    } catch (error) {
      console.error("Error fetching certificate:", error);
      alert("Failed to fetch certificate.");
    }
  };

  const handleDownloadCertificate = async (documentId, name) => {
    try {
      const response = await axios.get(
        `http://localhost:3000/download-certificate/${documentId}`,
        { responseType: "blob" }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${name}.zip`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error("Error downloading certificate:", error);
      alert("Failed to download certificate.");
    }
  };

  return (
    <div className="w-[calc(100%-350px)] ml-[310px] mt-[80px] p-6">
      {/* Status filter & search input */}
      <div className="bg-white shadow-lg rounded-lg border border-gray-300 mb-4">
        <div className="p-4 flex flex-wrap gap-4 items-center">
          <input
            type="text"
            placeholder="Search..."
            className="border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300 w-64"
            value={searchQuery}
            onChange={handleSearch}
          />
          {["Approved", "Completed", "Uploaded", "Pending", "Rejected"].map(
            (status) => (
              <label className="flex items-center" key={status}>
                <input
                  type="radio"
                  name="status"
                  value={status}
                  checked={statusFilter === status}
                  onChange={handleStatusFilterChange}
                  className="mr-2"
                />
                {status}
              </label>
            )
          )}
        </div>
      </div>

      <div className="table-container border border-gray-300 rounded-lg shadow-md ">
        <table className="table border-collapse border border-gray-300 min-w-full">
          <thead className="bg-gray-300">
            <tr>
              <th className="border p-2 text-center font-bold">Sr No.</th>
              <th className="border p-2 text-center font-bold">
                Application Id
              </th>
              <th className="border p-2 text-center font-bold">
                Applicant Name
              </th>

              <th className="border p-2 text-center font-bold">Datetime</th>

              <th className="border p-2 font-bold">Category</th>
              <th className="border p-2 font-bold">Subcategory</th>
              <th className="border p-2 font-bold">VLE Name</th>
              <th className="border p-2 font-bold">VLE Email</th>
              <th className="border p-2 font-bold">VLE Phone</th>

              <th className="border p-2 font-bold">Assigned Distributor</th>
              <th className="border p-2 font-bold">Verification</th>
              <th className="border p-2 font-bold">Action</th>
              <th className="border p-2 font-bold">View</th>
              <th className="border p-2 font-bold">Receipt</th>

              <th className="border p-2 font-bold">Certificate</th>
            </tr>
          </thead>
          <tbody>
            {filteredDocuments.map((doc, index) => (
              <tr
                key={doc.document_id}
                className={`border-t ${
                  index % 2 === 0 ? "bg-white" : "bg-white"
                } hover:bg-gray-100`}
              >
                <td className="border p-2 text-center">{index + 1}</td>

                <td className="border p-2 text-center">{doc.application_id}</td>
                <td className="px-4 py-2 border text-sm">
                  {doc?.document_fields ? (
                    Array.isArray(doc.document_fields) ? (
                      // New format (array of objects)
                      doc.document_fields.find(
                        (field) => field.field_name === "APPLICANT NAME"
                      ) ? (
                        <p>
                          {
                            doc.document_fields.find(
                              (field) => field.field_name === "APPLICANT NAME"
                            ).field_value
                          }
                        </p>
                      ) : (
                        <p className="text-gray-500">
                          No applicant name available
                        </p>
                      )
                    ) : // Old format (object with key-value pairs)
                    doc.document_fields["APPLICANT NAME"] ? (
                      <p>{doc.document_fields["APPLICANT NAME"]}</p>
                    ) : (
                      <p className="text-gray-500">
                        No applicant name available
                      </p>
                    )
                  ) : (
                    <p className="text-gray-500">No fields available</p>
                  )}
                </td>
                <td className="border p-2 text-center">
                  {(() => {
                    const date = new Date(doc.uploaded_at);
                    const formattedDate = `${String(date.getDate()).padStart(
                      2,
                      "0"
                    )}-${String(date.getMonth() + 1).padStart(
                      2,
                      "0"
                    )}-${date.getFullYear()}`;
                    const formattedTime = date.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: true,
                    });
                    return (
                      <>
                        <div>{formattedDate}</div>
                        <div className="text-sm text-gray-600">
                          {formattedTime}
                        </div>
                      </>
                    );
                  })()}
                </td>
                <td className="border p-2">{doc.category_name}</td>
                <td className="border p-2">{doc.subcategory_name}</td>
                <td className="border p-2">{doc.name}</td>
                <td className="border p-2 break-words">{doc.email}</td>
                <td className="border p-2 break-words">{doc.phone}</td>

                <td className="border p-2">
                  {getDistributorName(doc.distributor_id)}
                </td>
                <td className="border p-2">
                  <div className="flex flex-col gap-1">
                    {/* Status Badge */}
                    <span
                      className={`px-3 py-1 rounded-full text-white text-xs ${
                        doc.status === "Approved"
                          ? "bg-green-500"
                          : doc.status === "Rejected"
                          ? "bg-red-500"
                          : doc.status === "Pending"
                          ? "bg-yellow-500"
                          : "bg-blue-500"
                      }`}
                    >
                      {doc.status}
                    </span>

                    {/* Latest Status Date and Time */}
                    {doc.status_history
                      ?.sort(
                        (a, b) =>
                          new Date(b.updated_at) - new Date(a.updated_at)
                      )
                      .slice(0, 1)
                      .map((statusEntry, index) => {
                        const dateObj = new Date(statusEntry.updated_at);
                        const day = String(dateObj.getDate()).padStart(2, "0");
                        const month = String(dateObj.getMonth() + 1).padStart(
                          2,
                          "0"
                        );
                        const year = dateObj.getFullYear();
                        const time = dateObj.toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          hour12: true,
                        });

                        return (
                          <div key={index} className="text-xs text-gray-600">
                            {`${day}-${month}-${year} ${time}`}
                          </div>
                        );
                      })}
                  </div>
                </td>

                <td className="border p-2 text-center">
                  <button
                    onClick={() => handleViewInvoice(doc.document_id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                  >
                    <FaFileInvoice className="mr-1" /> Action
                  </button>
                </td>

                <td className="border p-2 text-center">
                  <button
                    onClick={() =>
                      handleView(
                        doc.document_id,
                        doc.category_id,
                        doc.subcategory_id
                      )
                    }
                    className="bg-indigo-500 text-white px-3 py-1 rounded hover:bg-indigo-600 transition text-xs"
                  >
                    <FaRegFileAlt className="mr-1" /> View
                  </button>
                </td>
                <td className="border p-3 text-center">
                  {doc.receipt_url ? ( // Check if receipt_url exists
                    <button
                      onClick={() =>
                        handleDownloadReceipt(doc.receipt_url, doc.name)
                      }
                      className="bg-orange-500 text-white px-3 py-1 rounded flex justify-center items-center hover:bg-blue-600 transition"
                    >
                      <FaDownload className="mr-1" /> Receipt
                    </button>
                  ) : (
                    <span className="text-gray-500 text-center">
                      Not Available
                    </span>
                  )}
                </td>
                <td className="border p-2 text-center">
                  {getCertificateByDocumentId(doc.document_id) ? (
                    <button
                      onClick={() => handleViewCertificate(doc.document_id)}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition text-xs"
                    >
                      <FaCheck className="mr-1" /> Certificate
                    </button>
                  ) : (
                    <span className="text-gray-500">Not Available</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ElistPage;
