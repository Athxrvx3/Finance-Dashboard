import { createSlice, nanoid } from '@reduxjs/toolkit';
import { saveUserData, loadUserData } from '../../utils/persist';

function getCurrentUsername() {
  return localStorage.getItem('username');
}

const username = getCurrentUsername();
const initialState = {
  transactions: loadUserData(username, 'transactions', []),
};

const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    addTransaction: (state, action) => {
      const newTransaction = {
        id: nanoid(),
        ...action.payload,
      };
      state.transactions.push(newTransaction);
      saveUserData(getCurrentUsername(), 'transactions', state.transactions);
    },
    setTransactions: (state, action) => {
      state.transactions = action.payload;
      saveUserData(getCurrentUsername(), 'transactions', state.transactions);
    },
    removeTransaction: (state, action) => {
      state.transactions = state.transactions.filter(t => t.id !== action.payload);
      saveUserData(getCurrentUsername(), 'transactions', state.transactions);
    },
  },
});

export const { addTransaction, setTransactions, removeTransaction } = transactionSlice.actions;
export default transactionSlice.reducer;