
// @vendors
import { useState } from 'react';

// @config
import { API_URLS } from '../config';

export const usePay = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const pay = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URLS.pay, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Payment failed');
      }
      
      return { success: true, data };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return { pay, loading, error };
}; 