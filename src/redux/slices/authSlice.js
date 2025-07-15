import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  username: localStorage.getItem('username') || null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state, action) {
      state.username = action.payload;
      localStorage.setItem('username', action.payload);
    },
    logout(state) {
      state.username = null;
      localStorage.removeItem('username');
      // DO NOT remove any other keys here!
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;