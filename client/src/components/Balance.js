// @vendors
import React from 'react';

// @components
import TransactionHistory from './TransactionHistory';

function Balance({ 
  form, 
  updateForm, 
  handleSubmit, 
  currentBalance,
  transactions,
  currentPage,
  pagination
}) {
  return (
    <section className="balance-section">
      <h2>Check Balance</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Document"
          value={form.document}
          onChange={(e) => updateForm('document', e.target.value)}
          required
        />
        <input
          type="tel"
          placeholder="Phone"
          value={form.phone}
          onChange={(e) => updateForm('phone', e.target.value)}
          required
        />
        <button type="submit">Check Balance</button>
      </form>
      
      {currentBalance !== null && (
        <div className="balance-display">
          <h3>Current Balance</h3>
          <div className="balance-amount">
            ${currentBalance}
          </div>
        </div>
      )}

      <TransactionHistory 
        transactions={transactions}
        currentPage={currentPage}
        pagination={pagination}
        handleCheckBalance={handleSubmit}
      />
    </section>
  );
}

export default Balance; 