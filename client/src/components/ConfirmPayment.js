// @vendors
import React, { useState } from 'react';

// @hooks
import { useConfirmPay } from '../hooks/useConfirmPay';

const ConfirmPayment = () => {
  const [formData, setFormData] = useState({
    sessionId: '',
    token: ''
  });

  const [message, setMessage] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const { confirmPay, loading, error } = useConfirmPay();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setMessage('');

      const result = await confirmPay(formData);
      if (result.success) {
        setMessage('Payment confirmed successfully!');
        setIsConfirmed(true);
      }
    } catch (err) {
      console.error('Error confirming payment:', err);
    }
  };

  const handleNewConfirmation = () => {
    setFormData({
      sessionId: '',
      token: ''
    });
    setMessage('');
    setIsConfirmed(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 transition-all duration-300 hover:shadow-xl">
      {!isConfirmed ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Session ID:</label>
            <input
              type="text"
              value={formData.sessionId}
              onChange={(e) => setFormData({ ...formData, sessionId: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
              placeholder="Enter session ID"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Token:</label>
            <input
              type="text"
              value={formData.token}
              onChange={(e) => setFormData({ ...formData, token: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
              placeholder="Enter token"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 
              ${loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700 active:bg-green-800 hover:shadow-md'}`}
          >
            {loading ? 'Confirming...' : 'Confirm Payment'}
          </button>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col items-center justify-center p-6 bg-green-50 rounded-lg border border-green-200">
            <p className="text-lg font-medium text-green-600">{message}</p>
          </div>
          <button
            onClick={handleNewConfirmation}
            className="w-full py-3 px-4 rounded-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition-all duration-200 hover:shadow-md"
          >
            Confirm Another Payment
          </button>
        </div>
      )}

      {error && (
        <div className="mt-6 p-4 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm font-medium text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
};

export default ConfirmPayment; 