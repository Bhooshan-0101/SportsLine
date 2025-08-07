import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,

  FormControlLabel,
  Switch
} from '@mui/material';
import {
  Add,
  Delete,
  CloudUpload,
  SportsSoccer,
  Assignment,
  CheckCircle
} from '@mui/icons-material';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { productsAPI, bulkOrdersAPI, uploadAPI } from '../services/api';
import { toast } from 'react-toastify';

const steps = ['Team Information', 'Jersey Details', 'Player Information', 'Review & Submit'];



// Validation schema
const schema = yup.object({
  teamName: yup.string().required('Team name is required'),
  contactPerson: yup.object({
    name: yup.string().required('Contact name is required'),
    email: yup.string().email('Invalid email').required('Contact email is required'),
    phone: yup.string().required('Contact phone is required')
  }),
  jerseyDetails: yup.object({
    baseProduct: yup.string().required('Base product is required'),
    material: yup.string().required('Material is required'),
    style: yup.string().required('Style is required')
  }),
  playerDetails: yup.array().min(1, 'At least one player is required'),
  shippingAddress: yup.object({
    name: yup.string().required('Shipping name is required'),
    street: yup.string().required('Street address is required'),
    city: yup.string().required('City is required'),
    state: yup.string().required('State is required'),
    zipCode: yup.string().required('ZIP code is required')
  })
});

const BulkJerseyOrder = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [hasCustomDesign, setHasCustomDesign] = useState(false);


  const {
    register,
    control,
    handleSubmit,
    formState: { errors },

    getValues
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      teamName: '',
      contactPerson: {
        name: user?.firstName + ' ' + user?.lastName || '',
        email: user?.email || '',
        phone: user?.phone || ''
      },
      jerseyDetails: {
        baseProduct: '',
        material: 'polyester',
        style: 'home'
      },
      playerDetails: [{ playerName: '', jerseyNumber: 1, size: 'M', position: '', specialRequests: '' }],
      shippingAddress: {
        name: user?.firstName + ' ' + user?.lastName || '',
        street: user?.address?.street || '',
        city: user?.address?.city || '',
        state: user?.address?.state || '',
        zipCode: user?.address?.zipCode || ''
      },
      notes: { customer: '' }
    }
  });

  const { fields: playerFields, append: addPlayer, remove: removePlayer } = useFieldArray({
    control,
    name: 'playerDetails'
  });

  // Fetch jersey products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productsAPI.getProducts({ category: 'jerseys' });
        setProducts(response.data.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchProducts();
  }, []);

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    const formData = new FormData();
    
    files.forEach(file => {
      formData.append('designs', file);
    });

    try {
      setLoading(true);
      const response = await uploadAPI.uploadJerseyDesign(Array.from(files));
      
      setUploadedFiles(prev => [...prev, ...response.data.data]);
      toast.success('Files uploaded successfully!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'File upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = (e) => {
    e.preventDefault(); // Prevent form submission
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = (e) => {
    e.preventDefault(); // Prevent form submission
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    
    try {
      const orderData = {
        ...data,
        customDesign: {
          hasCustomDesign,
          designFiles: uploadedFiles,
          designNotes: data.notes?.customer || ''
        }
      };

      const response = await bulkOrdersAPI.createBulkOrder(orderData);
      
      if (response.data.success) {
        toast.success('Bulk jersey order submitted successfully!');
        navigate(`/bulk-orders/${response.data.data._id}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit order');
    } finally {
      setLoading(false);
    }
  };

  const addNewPlayer = () => {
    const existingNumbers = getValues('playerDetails').map(p => p.jerseyNumber);
    let newNumber = 1;
    while (existingNumbers.includes(newNumber)) {
      newNumber++;
    }
    
    addPlayer({
      playerName: '',
      jerseyNumber: newNumber,
      size: 'M',
      position: '',
      specialRequests: ''
    });
  };

  const renderTeamInformation = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Team Information
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Team Name"
            {...register('teamName')}
            error={!!errors.teamName}
            helperText={errors.teamName?.message}
          />
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Contact Person Name"
            {...register('contactPerson.name')}
            error={!!errors.contactPerson?.name}
            helperText={errors.contactPerson?.name?.message}
          />
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Contact Email"
            type="email"
            {...register('contactPerson.email')}
            error={!!errors.contactPerson?.email}
            helperText={errors.contactPerson?.email?.message}
          />
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Contact Phone"
            {...register('contactPerson.phone')}
            error={!!errors.contactPerson?.phone}
            helperText={errors.contactPerson?.phone?.message}
          />
        </Grid>

        {/* Shipping Address */}
        <Grid item xs={12}>
          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
            Shipping Address
          </Typography>
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Recipient Name"
            {...register('shippingAddress.name')}
            error={!!errors.shippingAddress?.name}
            helperText={errors.shippingAddress?.name?.message}
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Street Address"
            {...register('shippingAddress.street')}
            error={!!errors.shippingAddress?.street}
            helperText={errors.shippingAddress?.street?.message}
          />
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="City"
            {...register('shippingAddress.city')}
            error={!!errors.shippingAddress?.city}
            helperText={errors.shippingAddress?.city?.message}
          />
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="State"
            {...register('shippingAddress.state')}
            error={!!errors.shippingAddress?.state}
            helperText={errors.shippingAddress?.state?.message}
          />
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="ZIP Code"
            {...register('shippingAddress.zipCode')}
            error={!!errors.shippingAddress?.zipCode}
            helperText={errors.shippingAddress?.zipCode?.message}
          />
        </Grid>
      </Grid>
    </Box>
  );

  const renderJerseyDetails = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Jersey Specifications
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Base Jersey Product</InputLabel>
            <Controller
              name="jerseyDetails.baseProduct"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <Select
                  {...field}
                  error={!!errors.jerseyDetails?.baseProduct}
                >
                  {products.map((product) => (
                    <MenuItem key={product._id} value={product._id}>
                      {product.name} - ₹{product.price}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
          </FormControl>
        </Grid>
        

        




        {/* Custom Design Upload */}
        <Grid item xs={12}>
          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
            Custom Jersey Options
          </Typography>

          {/* Material and Style Options */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Material</InputLabel>
                <Controller
                  name="jerseyDetails.material"
                  control={control}
                  defaultValue="polyester"
                  render={({ field }) => (
                    <Select {...field}>
                      <MenuItem value="polyester">Polyester</MenuItem>
                      <MenuItem value="cotton">Cotton</MenuItem>
                      <MenuItem value="cotton-polyester">Cotton-Polyester Blend</MenuItem>
                      <MenuItem value="dri-fit">Dri-FIT</MenuItem>
                      <MenuItem value="mesh">Mesh</MenuItem>
                    </Select>
                  )}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Style</InputLabel>
                <Controller
                  name="jerseyDetails.style"
                  control={control}
                  defaultValue="home"
                  render={({ field }) => (
                    <Select {...field}>
                      <MenuItem value="home">Home</MenuItem>
                      <MenuItem value="away">Away</MenuItem>
                      <MenuItem value="third">Third</MenuItem>
                      <MenuItem value="training">Training</MenuItem>
                      <MenuItem value="goalkeeper">Goalkeeper</MenuItem>
                    </Select>
                  )}
                />
              </FormControl>
            </Grid>
          </Grid>

          <FormControlLabel
            control={
              <Switch
                checked={hasCustomDesign}
                onChange={(e) => setHasCustomDesign(e.target.checked)}
              />
            }
            label="I have a custom design"
          />

          {hasCustomDesign && (
            <Box sx={{ mt: 2 }}>
              <input
                accept=".pdf"
                style={{ display: 'none' }}
                id="design-upload"
                multiple
                type="file"
                onChange={handleFileUpload}
              />
              <label htmlFor="design-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<CloudUpload />}
                  disabled={loading}
                >
                  Upload Design Files (PDF)
                </Button>
              </label>
              
              {uploadedFiles.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    Uploaded Files:
                  </Typography>
                  {uploadedFiles.map((file, index) => (
                    <Chip
                      key={index}
                      label={file.originalName}
                      onDelete={() => setUploadedFiles(prev => prev.filter((_, i) => i !== index))}
                      sx={{ mr: 1, mb: 1 }}
                    />
                  ))}
                </Box>
              )}
              
              <TextField
                fullWidth
                label="Design Notes"
                multiline
                rows={3}
                {...register('notes.customer')}
                sx={{ mt: 2 }}
                placeholder="Describe your design requirements, colors, logos, etc."
              />
            </Box>
          )}
        </Grid>
      </Grid>
    </Box>
  );

  const renderPlayerInformation = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          Player Information ({playerFields.length} players)
        </Typography>
        <Button
          startIcon={<Add />}
          onClick={addNewPlayer}
          variant="contained"
        >
          Add Player
        </Button>
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Player Name</TableCell>
              <TableCell>Number</TableCell>
              <TableCell>Size</TableCell>
              <TableCell>Position</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {playerFields.map((field, index) => (
              <TableRow key={field.id}>
                <TableCell>
                  <TextField
                    size="small"
                    {...register(`playerDetails.${index}.playerName`)}
                    placeholder="Player Name"
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    type="number"
                    {...register(`playerDetails.${index}.jerseyNumber`)}
                    sx={{ width: 80 }}
                  />
                </TableCell>
                <TableCell>
                  <FormControl size="small" sx={{ minWidth: 80 }}>
                    <Controller
                      name={`playerDetails.${index}.size`}
                      control={control}
                      defaultValue="M"
                      render={({ field }) => (
                        <Select {...field}>
                          {['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'].map(size => (
                            <MenuItem key={size} value={size}>{size}</MenuItem>
                          ))}
                        </Select>
                      )}
                    />
                  </FormControl>
                </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    {...register(`playerDetails.${index}.position`)}
                    placeholder="Position"
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => removePlayer(index)}
                    color="error"
                    disabled={playerFields.length === 1}
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const renderReview = () => {
    const formData = getValues();
    const totalQuantity = formData.playerDetails?.length || 0;
    
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Order Review
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>Team Information</Typography>
                <Typography><strong>Team:</strong> {formData.teamName}</Typography>
                <Typography><strong>Contact:</strong> {formData.contactPerson?.name}</Typography>
                <Typography><strong>Email:</strong> {formData.contactPerson?.email}</Typography>
                <Typography><strong>Phone:</strong> {formData.contactPerson?.phone}</Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>Jersey Details</Typography>
                <Typography><strong>Material:</strong> {formData.jerseyDetails?.material}</Typography>
                <Typography><strong>Style:</strong> {formData.jerseyDetails?.style}</Typography>
                <Typography><strong>Total Quantity:</strong> {totalQuantity} jerseys</Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Players ({formData.playerDetails?.length || 0})
                </Typography>
                <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                  {formData.playerDetails?.map((player, index) => (
                    <Typography key={index} variant="body2">
                      #{player.jerseyNumber} {player.playerName} ({player.size})
                      {player.position && ` - ${player.position}`}
                    </Typography>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="body2">
            Your bulk jersey order will be reviewed by our team. You will receive a confirmation email 
            with pricing details and estimated delivery timeline within 24 hours.
          </Typography>
        </Alert>
      </Box>
    );
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0: return renderTeamInformation();
      case 1: return renderJerseyDetails();
      case 2: return renderPlayerInformation();
      case 3: return renderReview();
      default: return 'Unknown step';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <SportsSoccer sx={{ mr: 2, fontSize: 40, color: 'primary.main' }} />
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Bulk Jersey Order
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 4 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel
                StepIconComponent={({ active, completed }) => (
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: completed ? 'success.main' : active ? 'primary.main' : 'grey.300',
                      color: 'white'
                    }}
                  >
                    {completed ? <CheckCircle /> : index + 1}
                  </Box>
                )}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          {getStepContent(activeStep)}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              type="button"
              onClick={handleBack}
              disabled={activeStep === 0}
            >
              Back
            </Button>

            {activeStep === steps.length - 1 ? (
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <Assignment />}
              >
                {loading ? 'Submitting...' : 'Submit Order'}
              </Button>
            ) : (
              <Button
                type="button"
                variant="contained"
                onClick={handleNext}
              >
                Next
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default BulkJerseyOrder;
