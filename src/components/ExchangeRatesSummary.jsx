// src/components/ExchangeRatesSummary.jsx
import React, { useState } from 'react';
import { useSelector } from 'react-redux';

const ExchangeRatesSummary = () => {
  const exchangeRates = useSelector(state => state.settings.exchangeRates || {}); // ✅ Fixed here
  const baseCurrency = useSelector(state => state.settings.currency) || 'USD';
  const [search, setSearch] = useState('');

  const filteredRates = Object.entries(exchangeRates)
    .filter(([code]) => code.toLowerCase().includes(search.toLowerCase()))
    .slice(0, 10);

  return (
    <div className="p-4 bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-4">Exchange Rates (Base: {baseCurrency})</h2>

      <input
        type="text"
        placeholder="Search currency (e.g. INR, EUR)"
        className="p-2 border rounded w-full mb-4"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <table className="w-full text-left">
        <thead>
          <tr className="text-gray-600">
            <th className="py-1">Currency</th>
            <th className="py-1">Rate</th>
          </tr>
        </thead>
        <tbody>
          {filteredRates.length === 0 ? (
            <tr>
              <td colSpan="2" className="py-2 text-center text-gray-500">No results</td>
            </tr>
          ) : (
            filteredRates.map(([code, rate]) => (
              <tr key={code}>
                <td className="py-1 font-semibold">{code}</td>
                <td className="py-1">{rate}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ExchangeRatesSummary;
