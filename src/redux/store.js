import { configureStore } from '@reduxjs/toolkit';
import transactionsReducer from './slices/transactionSlice';
import settingsReducer from './slices/settingsSlice';
import authReducer from './slices/authSlice';
import { loadUserData } from '../utils/persist';

const username = localStorage.getItem('username');

const preloadedState = {
  transactions: {
    transactions: loadUserData(username, 'transactions', [])
  },
  settings: {
    currency: loadUserData(username, 'currency', 'USD'),
    monthlyBudget: loadUserData(username, 'monthlyBudget', 0)
  },
  auth: {
    username: username || null
  }
};

const store = configureStore({
  reducer: {
    transactions: transactionsReducer,
    settings: settingsReducer,
    auth: authReducer,
  },
  preloadedState,
});

export default store;