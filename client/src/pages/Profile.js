import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  Avatar,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Card,
  CardContent
} from '@mui/material';
import { Person, Edit, Lock, Save, Cancel } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../context/AuthContext';

// Validation schemas
const profileSchema = yup.object({
  firstName: yup
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name cannot exceed 50 characters')
    .required('First name is required'),
  lastName: yup
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name cannot exceed 50 characters')
    .required('Last name is required'),
  phone: yup
    .string()
    .matches(/^\+?[\d\s-()]+$/, 'Please enter a valid phone number')
    .optional(),
  'address.street': yup.string().optional(),
  'address.city': yup.string().optional(),
  'address.state': yup.string().optional(),
  'address.zipCode': yup.string().optional()
});

const passwordSchema = yup.object({
  currentPassword: yup
    .string()
    .required('Current password is required'),
  newPassword: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    )
    .required('New password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('newPassword'), null], 'Passwords must match')
    .required('Please confirm your password')
});

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    reset: resetProfile
  } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
      'address.street': user?.address?.street || '',
      'address.city': user?.address?.city || '',
      'address.state': user?.address?.state || '',
      'address.zipCode': user?.address?.zipCode || ''
    }
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword
  } = useForm({
    resolver: yupResolver(passwordSchema)
  });

  const onProfileSubmit = async (data) => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    const profileData = {
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      address: {
        street: data['address.street'],
        city: data['address.city'],
        state: data['address.state'],
        zipCode: data['address.zipCode']
      }
    };

    const result = await updateProfile(profileData);
    
    if (result.success) {
      setEditMode(false);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to update profile' });
    }
    setLoading(false);
  };

  const onPasswordSubmit = async (data) => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    const result = await changePassword(data.currentPassword, data.newPassword);
    
    if (result.success) {
      setPasswordDialogOpen(false);
      resetPassword();
      setMessage({ type: 'success', text: 'Password changed successfully!' });
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to change password' });
    }
    setLoading(false);
  };

  const handleEditToggle = () => {
    if (editMode) {
      resetProfile();
    }
    setEditMode(!editMode);
    setMessage({ type: '', text: '' });
  };

  const handlePasswordDialogClose = () => {
    setPasswordDialogOpen(false);
    resetPassword();
    setMessage({ type: '', text: '' });
  };

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Avatar sx={{ width: 80, height: 80, mr: 3, bgcolor: 'primary.main' }}>
            <Person fontSize="large" />
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" gutterBottom>
              {user.firstName} {user.lastName}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {user.email}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Member since {new Date(user.createdAt).toLocaleDateString()}
            </Typography>
          </Box>
          <Box>
            <Button
              variant={editMode ? "outlined" : "contained"}
              startIcon={editMode ? <Cancel /> : <Edit />}
              onClick={handleEditToggle}
              sx={{ mr: 1 }}
            >
              {editMode ? 'Cancel' : 'Edit Profile'}
            </Button>
            <Button
              variant="outlined"
              startIcon={<Lock />}
              onClick={() => setPasswordDialogOpen(true)}
            >
              Change Password
            </Button>
          </Box>
        </Box>

        {message.text && (
          <Alert severity={message.type} sx={{ mb: 3 }}>
            {message.text}
          </Alert>
        )}

        <Divider sx={{ mb: 4 }} />

        {/* Profile Form */}
        <Box component="form" onSubmit={handleProfileSubmit(onProfileSubmit)}>
          <Grid container spacing={3}>
            {/* Personal Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                {...registerProfile('firstName')}
                error={!!profileErrors.firstName}
                helperText={profileErrors.firstName?.message}
                disabled={!editMode}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                {...registerProfile('lastName')}
                error={!!profileErrors.lastName}
                helperText={profileErrors.lastName?.message}
                disabled={!editMode}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                value={user.email}
                disabled
                helperText="Email cannot be changed"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                {...registerProfile('phone')}
                error={!!profileErrors.phone}
                helperText={profileErrors.phone?.message}
                disabled={!editMode}
              />
            </Grid>

            {/* Address Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Address Information
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Street Address"
                {...registerProfile('address.street')}
                error={!!profileErrors['address.street']}
                helperText={profileErrors['address.street']?.message}
                disabled={!editMode}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="City"
                {...registerProfile('address.city')}
                error={!!profileErrors['address.city']}
                helperText={profileErrors['address.city']?.message}
                disabled={!editMode}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="State"
                {...registerProfile('address.state')}
                error={!!profileErrors['address.state']}
                helperText={profileErrors['address.state']?.message}
                disabled={!editMode}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="ZIP Code"
                {...registerProfile('address.zipCode')}
                error={!!profileErrors['address.zipCode']}
                helperText={profileErrors['address.zipCode']?.message}
                disabled={!editMode}
              />
            </Grid>

            {editMode && (
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={handleEditToggle}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<Save />}
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={20} /> : 'Save Changes'}
                  </Button>
                </Box>
              </Grid>
            )}
          </Grid>
        </Box>

        {/* Account Stats */}
        <Divider sx={{ my: 4 }} />
        <Typography variant="h6" gutterBottom>
          Account Statistics
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary.main">
                  {user.stats?.orderCount || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Orders
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary.main">
                  ${user.stats?.totalSpent || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Spent
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary.main">
                  {user.cart?.length || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Cart Items
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary.main">
                  {user.wishlist?.length || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Wishlist Items
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Change Password Dialog */}
      <Dialog open={passwordDialogOpen} onClose={handlePasswordDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handlePasswordSubmit(onPasswordSubmit)} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              fullWidth
              label="Current Password"
              type="password"
              {...registerPassword('currentPassword')}
              error={!!passwordErrors.currentPassword}
              helperText={passwordErrors.currentPassword?.message}
            />
            <TextField
              margin="normal"
              fullWidth
              label="New Password"
              type="password"
              {...registerPassword('newPassword')}
              error={!!passwordErrors.newPassword}
              helperText={passwordErrors.newPassword?.message}
            />
            <TextField
              margin="normal"
              fullWidth
              label="Confirm New Password"
              type="password"
              {...registerPassword('confirmPassword')}
              error={!!passwordErrors.confirmPassword}
              helperText={passwordErrors.confirmPassword?.message}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePasswordDialogClose}>Cancel</Button>
          <Button
            onClick={handlePasswordSubmit(onPasswordSubmit)}
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : 'Change Password'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Profile;
