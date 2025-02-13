import { useState } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

export const useRecharge = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const recharge = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/recharge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Recharge failed');
      }
      
      return { success: true, data };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return { recharge, loading, error };
}; 