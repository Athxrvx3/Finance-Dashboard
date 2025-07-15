import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addTransaction } from '../../redux/slices/transactionSlice';
import {
  Button,
  TextField,
  MenuItem,
  Grid,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';

const categories = ['Food', 'Rent', 'Utilities', 'Salary', 'Other'];

const AddTransactionForm = () => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    date: '',
    amount: '',
    description: '',
    category: '',
    type: 'expense',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(addTransaction({ ...formData, id: Date.now() }));
    setFormData({ date: '', amount: '', description: '', category: '', type: 'expense' });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Date"
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Amount"
            name="amount"
            type="number"
            value={formData.amount}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select name="category" value={formData.category} onChange={handleChange}>
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Type</InputLabel>
            <Select name="type" value={formData.type} onChange={handleChange}>
              <MenuItem value="income">Income</MenuItem>
              <MenuItem value="expense">Expense</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <Button type="submit" variant="contained" fullWidth>
            Add Transaction
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};

export default AddTransactionForm;
