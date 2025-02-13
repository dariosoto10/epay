import { useState } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

export const useConfirmPay = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const confirmPay = async ({ sessionId, token }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/confirm-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId, token })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Payment confirmation failed');
      }
      
      return { success: true, data };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return { confirmPay, loading, error };
}; 