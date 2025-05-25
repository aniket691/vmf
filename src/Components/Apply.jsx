import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import {
  FaFileAlt,
  FaDownload,
  FaExclamationTriangle,
  FaTimes,
} from "react-icons/fa";

const SMS_URL = "http://localhost:3000/sms/send";
const SMS_SENDER = "918308178738"; // your LiveOne-registered "from" number

const Apply = () => {
  const [documentNames, setDocumentNames] = useState([]);
  const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const [selectedFiles, setSelectedFiles] = useState({});
  const [servicePrice, setServicePrice] = useState(0);
  const [statusMsg, setStatusMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [priceLoading, setPriceLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const location = useLocation();
  const { categoryId, categoryName, subcategoryId, subcategoryName } =
    location.state || {};

  const [fieldNames, setFieldNames] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");


  const authHeaders = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const [userData, setUserData] = useState({
    user_id: "",
    name: "",
    email: "",
    phone: "",
  });

  const [formData, setFormData] = useState({
    user_id: "",
    category_id: categoryId || "",
    subcategory_id: subcategoryId || "",
    category_name: categoryName || "",
    subcategory_name: subcategoryName || "",
    name: "",
    email: "",
    phone: "",
    address: "",
    files: {},
    document_fields: {},
  });

  // Decode JWT token to get user data
  useEffect(() => {
    if (token) {
      try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const decodedPayload = JSON.parse(atob(base64));

        setUserData({
          user_id: decodedPayload?.user_id
            ? String(decodedPayload.user_id)
            : "",
          name: decodedPayload?.name || "",
          email: decodedPayload?.email || "",
          phone: decodedPayload?.phone || "",
        });
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, [token]);

  // Update form data when user data is available
  useEffect(() => {
    if (userData.user_id) {
      setFormData((prev) => ({
        ...prev,
        user_id: Number(userData.user_id),
        name: userData.name || "",
        email: userData.email || "",
        phone: userData.phone || "",
      }));
    }
  }, [userData]);

  // Fetch service price
  const fetchServicePrice = async () => {
    if (!formData.category_id || !formData.subcategory_id) {
      console.log("Missing category or subcategory ID for price fetch");
      return;
    }

    setPriceLoading(true);
    try {
      // Try the specific endpoint first
      const response = await axios.get(
        `${API}/prices/${formData.category_id}/${formData.subcategory_id}`
      );

      if (response.data && response.data.amount) {
        setServicePrice(Number(response.data.amount));
      } else if (response.data && response.data.price) {
        setServicePrice(Number(response.data.price));
      } else {
        console.warn("Price data not found in expected format:", response.data);
        setServicePrice(0);
      }
    } catch (error) {
      console.error("Error fetching service price:", error);

      // Fallback: try to get all prices and filter
      try {
        const fallbackResponse = await axios.get(`${API}/prices`);
        const prices = fallbackResponse.data;

        const priceRecord = prices.find(
          (p) =>
            Number(p.category_id) === Number(formData.category_id) &&
            Number(p.subcategory_id) === Number(formData.subcategory_id)
        );

        if (priceRecord) {
          setServicePrice(Number(priceRecord.amount) || Number(priceRecord.price) || 0);
        } else {
          console.warn("No price found for this category/subcategory combination");
          setServicePrice(0);
        }
      } catch (fallbackError) {
        console.error("Error in fallback price fetch:", fallbackError);
        setServicePrice(0);
      }
    } finally {
      setPriceLoading(false);
    }
  };

  // Fetch price when category/subcategory changes
  useEffect(() => {
    if (formData.category_id && formData.subcategory_id) {
      fetchServicePrice();
    }
  }, [formData.category_id, formData.subcategory_id]);

  // Fetch required documents
  useEffect(() => {
    if (formData.category_id && formData.subcategory_id) {
      axios
        .get(
          `${API}/required-documents/${formData.category_id}/${formData.subcategory_id}`
        )
        .then((response) => {
          if (response.data.length > 0 && response.data[0].document_names) {
            const documentsArray = response.data[0].document_names
              .split(",")
              .map((doc) => doc.trim());
            setDocumentNames(documentsArray);
            setSelectedFiles(
              documentsArray.reduce((acc, doc) => ({ ...acc, [doc]: null }), {})
            );
          } else {
            setDocumentNames([]);
          }
        })
        .catch((error) => console.error("Error fetching documents:", error));
    } else {
      setDocumentNames([]);
    }
  }, [formData.category_id, formData.subcategory_id]);

  // Fetch field names
  useEffect(() => {
    if (formData.category_id && formData.subcategory_id) {
      axios
        .get(
          `${API}/field-names/${formData.category_id}/${formData.subcategory_id}`
        )
        .then((response) => {
          if (response.data.length > 0 && response.data[0].document_fields) {
            const fieldsArray = response.data[0].document_fields
              .split(",")
              .map((field) => field.trim());
            setFieldNames(fieldsArray);
            setFormData((prev) => ({
              ...prev,
              document_fields: fieldsArray.reduce(
                (acc, field) => ({ ...acc, [field]: "" }),
                {}
              ),
            }));
          } else {
            setFieldNames([]);
          }
        })
        .catch((error) => console.error("Error fetching field names:", error));
    } else {
      setFieldNames([]);
    }
  }, [formData.category_id, formData.subcategory_id]);

  const handleFieldChange = (e, fieldName) => {
    setFormData((prev) => ({
      ...prev,
      document_fields: { ...prev.document_fields, [fieldName]: e.target.value },
    }));
    setErrors((prev) => ({ ...prev, [fieldName]: "" }));
  };

  const handleFileUpload = (e, docName) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 500 * 1024) {
        setErrors((prev) => ({
          ...prev,
          [docName]: "File size is more than 500 KB.",
        }));
      } else {
        setErrors((prev) => ({ ...prev, [docName]: "" }));
        setSelectedFiles((prev) => ({ ...prev, [docName]: file }));
        setFormData((prev) => ({
          ...prev,
          files: { ...prev.files, [docName]: file },
        }));
      }
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const validateForm = () => {
    let newErrors = {};

    if (!formData.name) newErrors.name = "Full Name is required.";
    if (!formData.email) newErrors.email = "Email is required.";
    if (!formData.phone) newErrors.phone = "Phone Number is required.";

    fieldNames.forEach((field) => {
      if (!formData.document_fields[field]) {
        newErrors[field] = `${field} is required.`;
      }
    });

    documentNames.forEach((doc) => {
      if (!doc.toLowerCase().includes("other") && !selectedFiles[doc]) {
        newErrors[doc] = `${doc} file is required.`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkWalletBalance = async () => {
    try {
      const response = await axios.get(`${API}/wallet`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.balance >= servicePrice;
    } catch (error) {
      console.error("Error checking wallet balance:", error);
      return false;
    }
  };

  const debitFromWallet = async () => {
    try {
      const response = await axios.post(
        `${API}/wallet/debit`,
        {
          amount: servicePrice,
          description: `Payment for ${formData.subcategory_name} application`,
          reference_id: `APP_${Date.now()}`
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data.success;
    } catch (error) {
      console.error("Error debiting from wallet:", error);
      throw error;
    }
  };

  const sendNotifications = async () => {
    try {
      // SMS Logic
      let raw = formData.phone.replace(/^0+/, "");
      const phoneE164 = raw.startsWith("91") ? formData.phone : "91" + formData.phone;

      const smsMessage = `Thank you for joining with us! Your application of ${formData.subcategory_name} was successfully submitted. *Please wait for admin approval.*\n\n📄 Form Price: ₹${servicePrice}\n\nThank you for joining us! Visit again.`;

      await fetch(SMS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: SMS_SENDER,
          number: phoneE164,
          message: smsMessage,
        }),
      });

      // WhatsApp Logic (optional - replace with your actual WhatsApp API)
      const whatsappMessage = `Hello ${formData.name}, your application for '${formData.subcategory_name}' has been submitted successfully.\n📄 Form Price: ₹${servicePrice}\n\nThank you for registering at Mazedakhale!`;

      // Uncomment and replace with your actual WhatsApp API endpoint

      await fetch("https://your-whatsapp-api.com/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: `+91${formData.phone}`,
          message: whatsappMessage,
        }),
      });

    } catch (error) {
      console.error("Error sending notifications:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (!validateForm()) {
      Swal.fire({
        icon: "error",
        title: "Form Incomplete",
        text: "Please fill in all required fields.",
      });
      return;
    }

    // Check if service price is available
    if (!servicePrice || servicePrice <= 0) {
      Swal.fire({
        icon: "error",
        title: "Price Error",
        text: "Unable to determine service price. Please try again.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Check wallet balance first
      const hasBalance = await checkWalletBalance();

      if (!hasBalance) {
        Swal.fire({
          icon: "error",
          title: "Insufficient Balance",
          text: `You need ₹${servicePrice} in your wallet to submit this application. Please top up your wallet first.`,
        });
        setIsSubmitting(false);
        return;
      }

      Swal.fire({
        title: "Processing...",
        text: "Please wait while your application is being submitted and payment is processed.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // First, debit from wallet
      await debitFromWallet();

      // Create an ordered array of field objects
      const orderedDocumentFields = fieldNames.map((fieldName) => ({
        field_name: fieldName,
        field_value: formData.document_fields[fieldName] || "",
      }));

      const formDataToSend = new FormData();

      // Add the ordered document fields
      formDataToSend.append(
        "document_fields",
        JSON.stringify(orderedDocumentFields)
      );

      // Add service price
      formDataToSend.append("service_price", servicePrice);

      // Add other form data
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "document_fields") {
          // Skip this as we've already added the ordered version
        } else if (key === "files") {
          Object.entries(value).forEach(([fileKey, file]) => {
            formDataToSend.append("files", file);
            formDataToSend.append("document_types", fileKey);
          });
        } else {
          formDataToSend.append(key, value);
        }
      });

      // Submit the application
      const response = await axios.post(
        `${API}/documents/upload`,
        formDataToSend,
        authHeaders,
        {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 60000,
        }
      );

      // Send notifications
      await sendNotifications();

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: `Your application has been submitted successfully! ₹${servicePrice} has been debited from your wallet.`,
      }).then(() => {
        window.location.href = "/customerapply";
      });

    } catch (error) {
      console.error("Error in submission:", error);

      Swal.fire({
        icon: "error",
        title: "Submission Failed",
        text: error.response?.data?.message || error.message || "An error occurred while processing your request.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="ml-[250px] flex flex-col items-center min-h-screen p-6 bg-gray-100">
      <div className="w-[100%] max-w-6xl bg-white shadow-lg rounded-lg">
        <div className="relative border-t-4 border-orange-400 bg-[#F4F4F4] p-4 rounded-t-lg">
          <button
            onClick={() => {
              setIsAdding(false);
              navigate("/Cdashinner");
            }}
            className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-600 hover:text-gray-800"
          >
            <FaTimes size={20} />
          </button>
        </div>
        <form
          className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-6xxl border border-gray-200"
          onSubmit={handleSubmit}
        >
          <h2 className="text-3xl font-bold text-center text-orange-600 mb-3 shadow-md pb-2 rounded-lg">
            Apply for {formData.subcategory_name}
          </h2>

          {/* Service Price Display */}
          {priceLoading ? (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
              <p className="text-yellow-700 font-semibold">Loading service fee...</p>
            </div>
          ) : servicePrice > 0 ? (
            <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg text-center">
              <p className="text-orange-700 font-semibold">
                Service Fee: ₹{servicePrice}
              </p>
            </div>
          ) : (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-center">
              <p className="text-red-700 font-semibold">
                Service fee information not available
              </p>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 font-semibold text-base">
                Category <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.category_name}
                readOnly
                className="w-full mt-1 p-2 border border-gray-300 rounded-md bg-gray-100 shadow-sm text-sm"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold text-base">
                Subcategory <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.subcategory_name}
                readOnly
                className="w-full mt-1 p-2 border border-gray-300 rounded-md bg-gray-100 shadow-sm text-sm"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium text-base">
                VLE Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                onChange={handleChange}
                value={formData.name || ""}
                readOnly
                className={`w-full mt-1 p-2 border ${errors.name ? "border-red-500" : "border-gray-300"
                  } rounded-md bg-gray-100 shadow-sm cursor-not-allowed text-sm`}
                placeholder="Enter Full Name"
              />
              {errors.name && (
                <p className="text-red-500 text-xs">{errors.name}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 font-medium text-base">
                VLE Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                onChange={handleChange}
                value={formData.email || ""}
                readOnly
                className={`w-full mt-1 p-2 border ${errors.email ? "border-red-500" : "border-gray-300"
                  } rounded-md bg-gray-100 shadow-sm cursor-not-allowed text-sm`}
                placeholder="Enter Email"
              />
              {errors.email && (
                <p className="text-red-500 text-xs">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-gray-700 font-medium text-base">
                VLE Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="phone"
                onChange={handleChange}
                value={formData.phone || ""}
                readOnly
                className={`w-full mt-1 p-2 border ${errors.phone ? "border-red-500" : "border-gray-300"
                  } rounded-md bg-gray-100 shadow-sm cursor-not-allowed text-sm`}
                placeholder="Enter Phone Number"
              />
              {errors.phone && (
                <p className="text-red-500 text-xs">{errors.phone}</p>
              )}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-orange-700 font-bold text-lg text-center">
              APPLICANT INFORMATION <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-6">
              {fieldNames.map((field, index) => (
                <div key={index} className="mt-2">
                  <label className="block text-gray-600 mb-1 font-medium">
                    {field} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.document_fields[field] || ""}
                    onChange={(e) => handleFieldChange(e, field)}
                    className={`w-full p-3 border ${errors[field] ? "border-red-500" : "border-gray-300"
                      } rounded-lg shadow-md`}
                    placeholder={`Enter ${field}`}
                  />
                  {errors[field] && (
                    <p className="text-red-500 text-sm mt-1">{errors[field]}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-orange-700 font-bold text-lg text-center">
              UPLOAD DOCUMENTS <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-6">
              {documentNames.map((docName, index) => (
                <div key={index} className="mb-2">
                  <label className="block text-gray-700 font-semibold">
                    {docName}
                    {!docName.toLowerCase().includes("other") && (
                      <span className="text-red-500"> *</span>
                    )}
                  </label>
                  <input
                    type="file"
                    onChange={(e) => handleFileUpload(e, docName)}
                    className={`w-full mt-2 p-3 border ${errors[docName] ? "border-red-500" : "border-gray-300"
                      } rounded-lg bg-gray-100 shadow-md`}
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  />
                  {errors[docName] && (
                    <p className="text-red-500 text-sm">{errors[docName]}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 flex justify-center">
            <button
              type="submit"
              disabled={isSubmitting || priceLoading || servicePrice <= 0}
              className={`w-2/5 ${isSubmitting || priceLoading || servicePrice <= 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-orange-600 hover:bg-orange-700'
                } text-white font-bold p-3 rounded-lg shadow-lg transition-all text-lg`}
            >
              {isSubmitting
                ? 'Processing...'
                : priceLoading
                  ? 'Loading Price...'
                  : `Submit And Pay (₹${servicePrice})`
              }
            </button>
          </div>

          {statusMsg && (
            <div className="mt-4 text-center">
              <div className="text-green-600 text-sm">{statusMsg}</div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Apply;