import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setCurrency } from '../../redux/slices/settingsSlice';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const CurrencySelector = () => {
  const dispatch = useDispatch();
  const currency = useSelector((state) => state.settings.currency);
  const exchangeRates = useSelector((state) => state.settings.exchangeRates.rates || {});

  const handleChange = (e) => {
    dispatch(setCurrency(e.target.value));
  };

  const currencies = Object.keys(exchangeRates);

  return (
    <FormControl fullWidth style={{ maxWidth: 300, marginBottom: '1rem' }}>
      <InputLabel>Currency</InputLabel>
      <Select value={currency} label="Currency" onChange={handleChange}>
        {currencies.map((cur) => (
          <MenuItem key={cur} value={cur}>
            {cur}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default CurrencySelector;
