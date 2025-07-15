import { createSlice } from '@reduxjs/toolkit';
import { saveUserData, loadUserData } from '../../utils/persist';

// Helper to get username from localStorage (since slices can't access Redux state directly)
function getCurrentUsername() {
  return localStorage.getItem('username');
}

const username = getCurrentUsername();

const initialState = {
  currency: loadUserData(username, 'currency', 'USD'),
  theme: 'light',
  monthlyBudget: loadUserData(username, 'monthlyBudget', 0),
  exchangeRates: {},
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setCurrency: (state, action) => {
      state.currency = action.payload;
      saveUserData(getCurrentUsername(), 'currency', state.currency);
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    setMonthlyBudget: (state, action) => {
      state.monthlyBudget = Number(action.payload);
      saveUserData(getCurrentUsername(), 'monthlyBudget', state.monthlyBudget);
    },
    setExchangeRates: (state, action) => {
      state.exchangeRates = action.payload;
    },
  },
});

export const {
  setCurrency,
  toggleTheme,
  setMonthlyBudget,
  setExchangeRates,
} = settingsSlice.actions;

export default settingsSlice.reducer;