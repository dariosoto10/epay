import React from 'react';

function Navigation({ activeSection, handleSectionChange }) {
  return (
    <nav className="navigation">
      <button 
        className={activeSection === 'register' ? 'active' : ''} 
        onClick={() => handleSectionChange('register')}
      >
        Register
      </button>
      <button 
        className={activeSection === 'recharge' ? 'active' : ''} 
        onClick={() => handleSectionChange('recharge')}
      >
        Recharge
      </button>
      <button 
        className={activeSection === 'payment' ? 'active' : ''} 
        onClick={() => handleSectionChange('payment')}
      >
        Payment
      </button>
      <button 
        className={activeSection === 'confirm' ? 'active' : ''} 
        onClick={() => handleSectionChange('confirm')}
      >
        Confirm Payment
      </button>
      <button 
        className={activeSection === 'balance' ? 'active' : ''} 
        onClick={() => handleSectionChange('balance')}
      >
        Check Balance
      </button>
    </nav>
  );
}

export default Navigation; 