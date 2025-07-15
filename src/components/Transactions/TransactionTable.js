import React from 'react';
import { useSelector } from 'react-redux';

const TransactionTable = () => {
  const transactions = useSelector((state) => state.transactions.transactions || []);

  return (
    <div>
      <h3>Transactions</h3>
      {transactions.length === 0 ? (
        <p>No transactions yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Amount</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((txn, index) => (
              <tr key={index}>
                <td>{txn.description}</td>
                <td>{txn.amount}</td>
                <td>{txn.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TransactionTable;
