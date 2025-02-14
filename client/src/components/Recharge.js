// @vendors
import React from 'react';

function Recharge({ form, updateForm, handleSubmit }) {
  return (
    <section className="recharge-section">
      <h2>Recharge Wallet</h2>
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
        <input
          type="number"
          placeholder="Amount"
          min="0.01"
          step="0.01"
          value={form.amount}
          onChange={(e) => updateForm('amount', e.target.value)}
          required
        />
        <button type="submit">Recharge</button>
      </form>
    </section>
  );
}

export default Recharge; 