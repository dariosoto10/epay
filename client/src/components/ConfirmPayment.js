import React from 'react';

function ConfirmPayment({ form, updateForm, handleSubmit, paymentSession, loading, message }) {
  if (!form || !form.sessionId) {
    return (
      <section className="confirm-payment-section">
        <h2>Confirm Payment</h2>
        <p className="error-message">No active payment session. Please initiate a new payment.</p>
      </section>
    );
  }

  return (
    <section className="confirm-payment-section">
      <h2>Confirm Payment</h2>
      {message && message.type === 'success' ? (
        <div className="success-container">
          <p className="success-message">{message.text}</p>
          <p className="success-subtitle">Your payment has been processed successfully.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Session ID"
            value={form.sessionId || ''}
            onChange={(e) => updateForm('sessionId', e.target.value)}
            readOnly
            required
          />
          <input
            type="text"
            placeholder="Enter 6-digit token"
            value={form.token || ''}
            onChange={(e) => updateForm('token', e.target.value)}
            pattern="\d{6}"
            maxLength="6"
            autoFocus
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Confirming...' : 'Confirm Payment'}
          </button>
        </form>
      )}
      {paymentSession?.isMocked && (
        <div className="mock-info">
          <p>MOCK MODE</p>
          <p>Token: {paymentSession.token}</p>
        </div>
      )}
    </section>
  );
}

export default ConfirmPayment; 