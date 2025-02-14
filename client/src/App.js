// @vendors
import React, { useState, useEffect } from 'react';

// @components
import Register from './components/Register';
import Recharge from './components/Recharge';
import Payment from './components/Payment';
import ConfirmPayment from './components/ConfirmPayment';
import Balance from './components/Balance';
import Navigation from './components/Navigation';

// @hooks
import { useFormState } from './hooks/useFormState';
import { useRegister } from './hooks/useRegister';
import { useRecharge } from './hooks/useRecharge';
import { usePay } from './hooks/usePay';
import { useConfirmPay } from './hooks/useConfirmPay';
import { useHandlers } from './hooks/useHandlers';

// @constants
import { SECTIONS } from './constants/sections';

// @styles
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

function App() {
  // Form States
  const [registerForm, updateRegisterForm, resetRegisterForm] = useFormState(SECTIONS.REGISTER);
  const [rechargeForm, updateRechargeForm, resetRechargeForm] = useFormState(SECTIONS.RECHARGE);
  const [paymentForm, updatePaymentForm, resetPaymentForm] = useFormState(SECTIONS.PAYMENT);
  const [confirmationForm, updateConfirmationForm, resetConfirmationForm] = useFormState(SECTIONS.CONFIRM);
  const [balanceForm, updateBalanceForm, resetBalanceForm] = useFormState(SECTIONS.BALANCE);

  // UI States
  const [activeSection, setActiveSection] = useState(SECTIONS.REGISTER);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  // Data States
  const [paymentSession, setPaymentSession] = useState(null);
  const [currentBalance, setCurrentBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  // API Hooks
  const { register, loading: registerLoading } = useRegister();
  const { recharge, loading: rechargeLoading } = useRecharge();
  const { pay, loading: payLoading } = usePay();
  const { confirmPay, loading: confirmPayLoading } = useConfirmPay();

  // Handlers Hook
  const {
    handleSectionChange,
    handleRegister,
    handleRecharge,
    handlePayment,
    handleConfirmPayment
  } = useHandlers({
    register,
    recharge,
    pay,
    confirmPay,
    forms: {
      register: registerForm,
      recharge: rechargeForm,
      payment: paymentForm,
      confirm: confirmationForm,
      balance: balanceForm
    },
    updateForms: {
      register: updateRegisterForm,
      recharge: updateRechargeForm,
      payment: updatePaymentForm,
      confirm: updateConfirmationForm,
      balance: updateBalanceForm
    },
    resetForms: {
      register: resetRegisterForm,
      recharge: resetRechargeForm,
      payment: resetPaymentForm,
      confirm: resetConfirmationForm,
      balance: resetBalanceForm
    },
    activeSection,
    setActiveSection,
    setPaymentSession,
    setMessage
  });

  useEffect(() => {
    setMessage({ text: '', type: '' });
  }, [activeSection]);

  const handleCheckBalance = async (e, page = 1) => {
    e?.preventDefault();
  
    try {
      const response = await fetch(
        `${API_URL}/balance?document=${balanceForm.document}&phone=${balanceForm.phone}&page=${page}&limit=10`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      
      const data = await response.json();
      
      if (response.ok) {
        setCurrentBalance(data.balance);
        setTransactions(data.Transactions);
        setPagination(data.pagination);
        setCurrentPage(page);
      } else {
        setCurrentBalance(null);
        setTransactions([]);
        setPagination(null);
        setMessage({ text: data.message || 'Failed to check balance', type: 'error' });
      }
    } catch (error) {
      console.error('Balance check error:', error);
      setCurrentBalance(null);
      setTransactions([]);
      setPagination(null);
      setMessage({ text: 'Error checking balance', type: 'error' });
    }
  };

  // Component Map
  const componentMap = {
    [SECTIONS.REGISTER]: (
      <Register 
        form={registerForm}
        updateForm={updateRegisterForm}
        handleSubmit={handleRegister}
        loading={registerLoading}
      />
    ),
    [SECTIONS.RECHARGE]: (
      <Recharge 
        form={rechargeForm}
        updateForm={updateRechargeForm}
        handleSubmit={handleRecharge}
        loading={rechargeLoading}
      />
    ),
    [SECTIONS.PAYMENT]: (
      <Payment 
        form={paymentForm}
        updateForm={updatePaymentForm}
        handleSubmit={handlePayment}
        loading={payLoading}
      />
    ),
    [SECTIONS.CONFIRM]: (
      <ConfirmPayment 
        form={confirmationForm}
        updateForm={updateConfirmationForm}
        handleSubmit={handleConfirmPayment}
        paymentSession={paymentSession}
        loading={confirmPayLoading}
        message={message}
      />
    ),
    [SECTIONS.BALANCE]: (
      <Balance 
        form={balanceForm}
        updateForm={updateBalanceForm}
        handleSubmit={handleCheckBalance}
        currentBalance={currentBalance}
        transactions={transactions}
        currentPage={currentPage}
        pagination={pagination}
      />
    )
  };

  return (
    <div className="App">
      <h1>E-Wallet System</h1>
      
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <Navigation 
        activeSection={activeSection} 
        handleSectionChange={handleSectionChange} 
      />

      {componentMap[activeSection]}
    </div>
  );
}

export default App; 