
import React, { useState } from 'react';
import { FaWallet } from 'react-icons/fa';

const RequestAmount = () => {
  const [formData, setFormData] = useState({
    account_number: '',
    ifsc_code: '',
    requested_amount: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // grab the JWT you stored on login
  
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    
    try {
      const token = localStorage.getItem('token');

      console.info("Token from local storage: ", token);
      
      const response = await fetch('http://localhost:3000/wallet_request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization':`Bearer ${token}` },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMessage('Request submitted successfully!');
        setFormData({
          account_number: '',
          ifsc_code: '',
          requested_amount: '',
        });
      } else {
        setMessage('Failed to submit request.');
        
      }
    } catch (error) {
      console.error("something went wrong while submit request amount ",error);
      setMessage('An error occurred. Please try again.');
    } finally {
      setLoading(false);

    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-lg">
        <div className="flex items-center justify-center mb-6">
          <FaWallet className="text-3xl text-blue-600 mr-2" />
          <h2 className="text-2xl font-bold text-blue-700">Request Amount</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600">Account Number</label>
            <input
              type="text"
              name="account_number"
              value={formData.account_number}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter account number"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600">IFSC Code</label>
            <input
              type="text"
              name="ifsc_code"
              value={formData.ifsc_code}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter IFSC code"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600">Requested Amount</label>
            <input
              type="number"
              name="requested_amount"
              value={formData.requested_amount}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter amount"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition duration-300"
          >
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>

        {message && (
          <div className="mt-4 text-center text-sm font-medium text-green-600">{message}</div>
        )}
      </div>
    </div>
  );
};

export default RequestAmount;
