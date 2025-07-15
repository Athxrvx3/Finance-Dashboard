import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import { clearUserData } from '../../utils/persist';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

const ClearDataButton = () => {
  const dispatch = useDispatch();
  const username = useSelector(state => state.auth.username);
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleConfirm = () => {
    clearUserData(username, 'transactions');
    clearUserData(username, 'currency');
    clearUserData(username, 'monthlyBudget');
    dispatch(logout());
    window.location.reload();
  };

  return (
    <>
      <Button color="secondary" variant="outlined" onClick={handleOpen}>
        Clear My Data
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Confirm Data Deletion</DialogTitle>
        <DialogContent>
          Are you sure you want to clear all your data? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary" variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleConfirm} color="error" variant="contained">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ClearDataButton;