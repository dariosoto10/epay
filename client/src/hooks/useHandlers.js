import { SECTIONS } from '../constants/sections';

export const useHandlers = (
  {
    register,
    recharge,
    pay,
    confirmPay,
    forms,
    updateForms,
    resetForms,
    activeSection,
    setActiveSection,
    setPaymentSession,
    setMessage
  }
) => {
  const clearFormStates = () => {
    const resetFunctions = {
      [SECTIONS.REGISTER]: resetForms.register,
      [SECTIONS.RECHARGE]: resetForms.recharge,
      [SECTIONS.PAYMENT]: resetForms.payment,
      [SECTIONS.CONFIRM]: resetForms.confirm,
    };

    resetFunctions[activeSection]?.();
    setPaymentSession(null);
    setMessage({ text: '', type: '' });
  };

  const handleSectionChange = (section) => {
    clearFormStates();
    setActiveSection(section);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const result = await register(forms.register);
    if (result.success) {
      setMessage({ text: 'Client registered successfully!', type: 'success' });
      resetForms.register();
    } else {
      setMessage({ text: result.error, type: 'error' });
    }
  };

  const handleRecharge = async (e) => {
    e.preventDefault();
    const result = await recharge(forms.recharge);
    if (result.success) {
      setMessage({ text: 'Wallet recharged successfully!', type: 'success' });
      resetForms.recharge();
    } else {
      setMessage({ text: result.error, type: 'error' });
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    const result = await pay(forms.payment);
    if (result.success) {
      setPaymentSession(result.data);
      updateForms.confirm('sessionId', result.data.sessionId);
      updateForms.confirm('token', '');
      setActiveSection(SECTIONS.CONFIRM);
      
      const messageText = result.data.isMocked
        ? `Payment initiated! Please enter the token: ${result.data.token}`
        : 'Payment initiated! Please check your email for the confirmation token.';
      
      setMessage({ text: messageText, type: 'success' });
      resetForms.payment();
    } else {
      setMessage({ text: result.error, type: 'error' });
    }
  };

  const handleConfirmPayment = async (e) => {
    e.preventDefault();
    if (!forms.confirm?.sessionId) {
      setMessage({ text: 'Invalid session. Please try payment again.', type: 'error' });
      return;
    }

    const result = await confirmPay(forms.confirm);
    if (result.success) {
      setMessage({ text: 'Payment confirmed successfully!', type: 'success' });
      setPaymentSession(null);
    } else {
      setMessage({ text: result.error, type: 'error' });
    }
  };

  return {
    handleSectionChange,
    handleRegister,
    handleRecharge,
    handlePayment,
    handleConfirmPayment
  };
}; 