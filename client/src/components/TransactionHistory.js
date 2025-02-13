import React from 'react';

function TransactionHistory({ transactions, currentPage, pagination, handleCheckBalance }) {
  const renderPagination = () => {
    if (!pagination) return null;

    return (
      <div className="pagination">
        <button
          onClick={() => handleCheckBalance(null, currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <div className="pagination-info">
          <span>Page {currentPage} of {pagination.totalPages}</span>
        </div>
        <button
          onClick={() => handleCheckBalance(null, currentPage + 1)}
          disabled={currentPage === pagination.totalPages}
        >
          Next
        </button>
      </div>
    );
  };

  if (!transactions || transactions.length === 0) {
    return <p>No transactions found</p>;
  }

  return (
    <div className="transactions-list">
      <h3>Transaction History</h3>
      <table>
        <thead>
          <tr>
            <th>Type</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t.id} className={t.type.toLowerCase()}>
              <td>{t.type}</td>
              <td>${parseFloat(t.amount).toFixed(2)}</td>
              <td>{t.status}</td>
              <td>{new Date(t.date).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {renderPagination()}
    </div>
  );
}

export default TransactionHistory; 