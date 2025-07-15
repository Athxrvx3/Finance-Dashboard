import axios from 'axios';

// Exchange Rate API
export const getExchangeRates = async () => {
  const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
  return response.data.rates;
};

// Random Transactions
export const getRandomTransactions = async () => {
  const response = await axios.get('https://random-data-api.com/api/v2/credit_cards?size=5');
  return response.data;
};
