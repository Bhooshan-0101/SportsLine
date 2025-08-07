import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import {
  ArrowBack,
  Add,
  Delete,
  Save,
  CloudUpload,
  Star
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { productsAPI, uploadAPI } from '../../services/api';
import { toast } from '../../utils/toast';

// Validation schema
const schema = yup.object({
  name: yup.string().required('Product name is required'),
  description: yup.string().required('Description is required'),
  shortDescription: yup.string().max(200, 'Short description must be under 200 characters'),
  category: yup.string().required('Category is required'),
  brand: yup.string(),
  price: yup.number().positive('Price must be positive').required('Price is required'),
  comparePrice: yup.number().positive('Compare price must be positive'),
  sku: yup.string(),
  inventory: yup.object({
    trackQuantity: yup.boolean(),
    quantity: yup.number().min(0, 'Quantity cannot be negative'),
    lowStockThreshold: yup.number().min(0, 'Threshold cannot be negative')
  })
});

const ProductForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadingImages, setUploadingImages] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      shortDescription: '',
      category: '',
      subcategory: '',
      brand: '',
      price: '',
      comparePrice: '',
      sku: '',
      inventory: {
        trackQuantity: true,
        quantity: 0,
        lowStockThreshold: 10
      },
      variants: [],
      images: [],
      specifications: [],
      tags: [],
      isActive: true,
      isFeatured: false,
      isCustomizable: false,
      customizationOptions: {
        allowNamePrint: false,
        allowNumberPrint: false,
        maxNameLength: 15,
        numberRange: { min: 1, max: 99 }
      }
    }
  });

  const { fields: variantFields, append: addVariant, remove: removeVariant } = useFieldArray({
    control,
    name: 'variants'
  });

  const { fields: specFields, append: addSpec, remove: removeSpec } = useFieldArray({
    control,
    name: 'specifications'
  });

  const categories = [
    { value: 'jerseys', label: 'Jerseys' },
    { value: 'sports-kits', label: 'Sports Kits' },
    { value: 'trophies', label: 'Trophies' },
    { value: 'equipment', label: 'Equipment' },
    { value: 'accessories', label: 'Accessories' }
  ];

  useEffect(() => {
    if (isEdit) {
      fetchProduct();
    }
  }, [id, isEdit]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getProduct(id);
      const product = response.data.data;

      // Reset form with product data
      console.log('Loaded product data:', product);
      console.log('Product images:', product.images);
      reset(product);
      setError('');
    } catch (err) {
      setError('Failed to fetch product');
      console.error('Error fetching product:', err);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      // Clean the data to remove undefined/null values
      const cleanData = { ...data };

      // Ensure numeric fields are properly formatted
      if (cleanData.price !== undefined && cleanData.price !== '') {
        cleanData.price = parseFloat(cleanData.price) || 0;
      }
      if (cleanData.comparePrice !== undefined && cleanData.comparePrice !== '') {
        cleanData.comparePrice = parseFloat(cleanData.comparePrice) || 0;
      }

      // Calculate discount percentage if compare price exists
      if (cleanData.comparePrice && cleanData.comparePrice > cleanData.price) {
        cleanData.discountPercentage = Math.round(((cleanData.comparePrice - cleanData.price) / cleanData.comparePrice) * 100);
      }

      // Remove undefined/null values
      Object.keys(cleanData).forEach(key => {
        if (cleanData[key] === undefined || cleanData[key] === null || cleanData[key] === '') {
          delete cleanData[key];
        }
      });

      // Upload images to server if they have file objects (new images)
      if (cleanData.images && cleanData.images.length > 0) {
        const imagesToUpload = cleanData.images.filter(img => img.file);

        if (imagesToUpload.length > 0) {
          try {
            console.log('Uploading images:', imagesToUpload.length, 'files');

            // Validate files before upload
            for (const img of imagesToUpload) {
              if (!img.file) {
                throw new Error('Invalid file object');
              }
              if (img.file.size > 10 * 1024 * 1024) { // 10MB limit
                throw new Error(`File "${img.file.name}" is too large. Maximum size is 10MB.`);
              }
              const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
              if (!allowedTypes.includes(img.file.type)) {
                throw new Error(`File "${img.file.name}" has invalid type. Only JPEG, PNG, GIF, and WebP are allowed.`);
              }
            }

            const files = imagesToUpload.map(img => img.file);
            console.log('Files to upload:', files.map(f => ({ name: f.name, size: f.size, type: f.type })));

            const uploadResponse = await uploadAPI.uploadProductImages(files);
            console.log('Upload response:', uploadResponse);

            if (!uploadResponse.data || !uploadResponse.data.success) {
              throw new Error(uploadResponse.data?.error || 'Upload failed');
            }

            // Replace blob URLs with server URLs
            const uploadedImages = uploadResponse.data.data;
            let uploadIndex = 0;

            cleanData.images = cleanData.images.map(img => {
              if (img.file) {
                const uploadedImg = uploadedImages[uploadIndex++];
                return {
                  url: uploadedImg.url,
                  alt: img.alt,
                  isPrimary: img.isPrimary
                };
              }
              return {
                url: img.url,
                alt: img.alt,
                isPrimary: img.isPrimary
              };
            });

            console.log('Images uploaded successfully');
          } catch (uploadError) {
            console.error('Image upload error:', uploadError);

            // Provide more specific error messages
            let errorMessage = 'Failed to upload images. Please try again.';
            if (uploadError.response) {
              // Server responded with error
              errorMessage = uploadError.response.data?.error || `Server error: ${uploadError.response.status}`;
            } else if (uploadError.request) {
              // Network error
              errorMessage = 'Network error. Please check your connection and try again.';
            } else if (uploadError.message) {
              // Custom error message
              errorMessage = uploadError.message;
            }

            toast.error(errorMessage);
            return;
          }
        }
      }

      console.log('Submitting clean data:', cleanData);
      let response;
      if (isEdit) {
        response = await productsAPI.updateProduct(id, cleanData);
        toast.success('Product updated successfully!');
      } else {
        response = await productsAPI.createProduct(cleanData);
        toast.success('Product created successfully!');
      }

      navigate('/admin/products');
    } catch (error) {
      toast.error(error.response?.data?.error || `Failed to ${isEdit ? 'update' : 'create'} product`);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    // Validate each file
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

    for (const file of files) {
      // Check file size
      if (file.size > maxSize) {
        toast.error(`Image "${file.name}" is too large. Maximum size is 10MB.`);
        return;
      }

      // Check file type
      if (!allowedTypes.includes(file.type)) {
        toast.error(`Invalid file type for "${file.name}". Please upload JPEG, PNG, GIF, or WebP images.`);
        return;
      }
    }

    try {
      setUploadingImages(true);

      const currentImages = watch('images') || [];
      const newImages = files.map((file, index) => ({
        id: Date.now() + index,
        url: URL.createObjectURL(file),
        alt: file.name,
        isPrimary: currentImages.length === 0 && index === 0, // First image is primary
        file: file // Store file for potential server upload
      }));

      setValue('images', [...currentImages, ...newImages]);
      toast.success(`${files.length} image(s) uploaded successfully!`);
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error('Image upload failed');
    } finally {
      setUploadingImages(false);
    }
  };

  // Helper function to get proper image URL
  const getImageUrl = (image) => {
    if (!image || !image.url) return '';

    // If it's already a full URL (starts with http), return as is
    if (image.url.startsWith('http')) {
      return image.url;
    }

    // If it's a blob URL, return as is (for preview)
    if (image.url.startsWith('blob:')) {
      return image.url;
    }

    // If it's a relative URL, make it absolute
    if (image.url.startsWith('/uploads/')) {
      return `http://localhost:5000${image.url}`;
    }

    // Default case
    return image.url;
  };

  const removeImage = (index) => {
    const currentImages = watch('images') || [];
    const newImages = currentImages.filter((_, i) => i !== index);
    setValue('images', newImages);
    toast.success('Image removed successfully!');
  };

  const setPrimaryImage = (index) => {
    const currentImages = watch('images') || [];
    const updatedImages = currentImages.map((img, i) => ({
      ...img,
      isPrimary: i === index
    }));
    setValue('images', updatedImages);
    toast.success('Primary image updated!');
  };

  if (loading && isEdit) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/admin/products')}
          sx={{ mr: 2 }}
        >
          Back to Products
        </Button>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          {isEdit ? 'Edit Product' : 'Add New Product'}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper elevation={2} sx={{ p: 4 }}>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Product Name"
                {...register('name')}
                error={!!errors.name}
                helperText={errors.name?.message}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="SKU"
                {...register('sku')}
                error={!!errors.sku}
                helperText={errors.sku?.message}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={4}
                {...register('description')}
                error={!!errors.description}
                helperText={errors.description?.message}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Short Description"
                {...register('shortDescription')}
                error={!!errors.shortDescription}
                helperText={errors.shortDescription?.message || 'Used for product cards and previews'}
              />
            </Grid>

            {/* Product Images */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Product Images
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Upload product images (JPEG, PNG, GIF, WebP) up to 10MB each. First image will be the primary image.
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="image-upload"
                  multiple
                  type="file"
                  onChange={handleImageUpload}
                />
                <label htmlFor="image-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={uploadingImages ? <CircularProgress size={20} /> : <CloudUpload />}
                    disabled={uploadingImages}
                    sx={{ mr: 2 }}
                  >
                    {uploadingImages ? 'Uploading...' : 'Upload Images'}
                  </Button>
                </label>

                {watch('images') && watch('images').length > 0 && (
                  <Typography variant="body2" color="text.secondary" component="span">
                    {watch('images').length} image(s) uploaded
                  </Typography>
                )}
              </Box>

              {/* Display uploaded images */}
              {watch('images') && watch('images').length > 0 && (
                console.log('Rendering images:', watch('images')) ||
                <Grid container spacing={2}>
                  {watch('images').map((image, index) => (
                    <Grid item xs={6} sm={4} md={3} key={index}>
                      <Card sx={{ position: 'relative' }}>
                        <Box sx={{ position: 'relative' }}>
                          <img
                            src={getImageUrl(image)}
                            alt={image.alt || `Product image ${index + 1}`}
                            style={{
                              width: '100%',
                              height: '150px',
                              objectFit: 'cover'
                            }}
                            onError={(e) => {
                              console.error('Image failed to load:');
                              console.error('Original URL:', image.url);
                              console.error('Processed URL:', getImageUrl(image));
                              // Try fallback to placeholder
                              e.target.src = '/placeholder-product.svg';
                              e.target.onerror = () => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              };
                            }}
                          />
                          <Box
                            sx={{
                              display: 'none',
                              alignItems: 'center',
                              justifyContent: 'center',
                              height: '150px',
                              bgcolor: 'grey.200',
                              color: 'text.secondary'
                            }}
                          >
                            Image not available
                          </Box>

                          {/* Primary badge */}
                          {image.isPrimary && (
                            <Chip
                              label="Primary"
                              size="small"
                              color="primary"
                              sx={{
                                position: 'absolute',
                                top: 4,
                                left: 4
                              }}
                            />
                          )}

                          {/* Action buttons */}
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 4,
                              right: 4,
                              display: 'flex',
                              gap: 0.5
                            }}
                          >
                            {!image.isPrimary && (
                              <IconButton
                                size="small"
                                sx={{
                                  bgcolor: 'rgba(255, 255, 255, 0.8)',
                                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' }
                                }}
                                onClick={() => setPrimaryImage(index)}
                                title="Set as primary image"
                              >
                                <Star fontSize="small" />
                              </IconButton>
                            )}
                            <IconButton
                              size="small"
                              sx={{
                                bgcolor: 'rgba(255, 255, 255, 0.8)',
                                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' }
                              }}
                              onClick={() => removeImage(index)}
                              title="Remove image"
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Grid>

            {/* Category & Pricing */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Category & Pricing
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  {...register('category')}
                  error={!!errors.category}
                  label="Category"
                >
                  {categories.map((category) => (
                    <MenuItem key={category.value} value={category.value}>
                      {category.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Brand"
                {...register('brand')}
                error={!!errors.brand}
                helperText={errors.brand?.message}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Price"
                type="number"
                step="0.01"
                {...register('price')}
                error={!!errors.price}
                helperText={errors.price?.message}
                InputProps={{ startAdornment: '₹' }}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Compare Price"
                type="number"
                step="0.01"
                {...register('comparePrice')}
                error={!!errors.comparePrice}
                helperText={errors.comparePrice?.message || 'Original price for discount display'}
                InputProps={{ startAdornment: '₹' }}
              />
            </Grid>

            {/* Inventory */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Inventory Management
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch {...register('inventory.trackQuantity')} />
                }
                label="Track Quantity"
              />
            </Grid>
            
            {watch('inventory.trackQuantity') && (
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Quantity"
                    type="number"
                    {...register('inventory.quantity')}
                    error={!!errors.inventory?.quantity}
                    helperText={errors.inventory?.quantity?.message}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Low Stock Threshold"
                    type="number"
                    {...register('inventory.lowStockThreshold')}
                    error={!!errors.inventory?.lowStockThreshold}
                    helperText={errors.inventory?.lowStockThreshold?.message}
                  />
                </Grid>
              </>
            )}

            {/* Product Status */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Product Status
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={<Switch {...register('isActive')} />}
                label="Active"
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={<Switch {...register('isFeatured')} />}
                label="Featured"
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={<Switch {...register('isCustomizable')} />}
                label="Customizable"
              />
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/admin/products')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : (isEdit ? 'Update Product' : 'Create Product')}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default ProductForm;
