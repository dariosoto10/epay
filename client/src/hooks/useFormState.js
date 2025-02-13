import { useState } from 'react';

const INITIAL_STATES = {
  register: {
    document: '',
    name: '',
    email: '',
    phone: ''
  },
  recharge: {
    document: '',
    phone: '',
    amount: ''
  },
  payment: {
    document: '',
    phone: '',
    amount: ''
  },
  confirmation: {
    sessionId: '',
    token: ''
  },
  balance: {
    document: '',
    phone: ''
  }
};

export const useFormState = (formType) => {
  const [formData, setFormData] = useState(INITIAL_STATES[formType]);

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetForm = () => {
    setFormData(INITIAL_STATES[formType]);
  };

  return [formData, updateFormData, resetForm];
}; 