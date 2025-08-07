import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,

  Chip,
  Button,
  CircularProgress,
  Alert,
  Divider,


  Breadcrumbs,
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from '../components/common/Timeline';
import {
  ArrowBack,
  SportsSoccer,
  Assignment,
  CheckCircle,
  Schedule,
  NavigateNext,
  Download,

} from '@mui/icons-material';
import { Link as RouterLink, useParams, useNavigate } from 'react-router-dom';
import { bulkOrdersAPI } from '../services/api';


const BulkOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const statusColors = {
    'pending_review': 'warning',
    'design_approval_needed': 'info',
    'approved': 'success',
    'in_production': 'primary',
    'quality_check': 'secondary',
    'ready_for_delivery': 'success',
    'completed': 'success',
    'cancelled': 'error',
    'on_hold': 'default'
  };

  const statusIcons = {
    'pending_review': <Schedule />,
    'design_approval_needed': <Assignment />,
    'approved': <CheckCircle />,
    'in_production': <SportsSoccer />,
    'quality_check': <CheckCircle />,
    'ready_for_delivery': <CheckCircle />,
    'completed': <CheckCircle />,
    'cancelled': <CheckCircle />,
    'on_hold': <Schedule />
  };

  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true);
      const response = await bulkOrdersAPI.getBulkOrder(id);
      setOrder(response.data.data);
      setError('');
    } catch (err) {
      setError('Bulk order not found');
      console.error('Error fetching bulk order:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderTimeline = () => {
    if (!order?.timeline) return null;

    // Convert timeline object to array of events
    const timelineEvents = [];

    // Add order created event
    timelineEvents.push({
      status: 'pending_review',
      timestamp: order.createdAt,
      note: 'Order submitted and pending review'
    });

    // Add design approval events
    if (order.timeline.designApproval?.required) {
      if (order.timeline.designApproval.approvedAt) {
        timelineEvents.push({
          status: 'approved',
          timestamp: order.timeline.designApproval.approvedAt,
          note: 'Design approved'
        });
      } else if (order.status === 'design_approval_needed') {
        timelineEvents.push({
          status: 'design_approval_needed',
          timestamp: order.createdAt,
          note: 'Waiting for design approval'
        });
      }
    }

    // Add production events
    if (order.timeline.production?.startDate) {
      timelineEvents.push({
        status: 'in_production',
        timestamp: order.timeline.production.startDate,
        note: 'Production started'
      });
    }

    if (order.timeline.production?.actualCompletion) {
      timelineEvents.push({
        status: 'quality_check',
        timestamp: order.timeline.production.actualCompletion,
        note: 'Production completed, quality check in progress'
      });
    }

    // Add delivery events
    if (order.timeline.delivery?.actualDate) {
      timelineEvents.push({
        status: 'completed',
        timestamp: order.timeline.delivery.actualDate,
        note: 'Order delivered'
      });
    }

    // Sort events by timestamp
    timelineEvents.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    return (
      <Timeline>
        {timelineEvents.map((event, index) => (
          <TimelineItem key={index}>
            <TimelineSeparator>
              <TimelineDot color={statusColors[event.status] || 'grey'}>
                {statusIcons[event.status] || <Schedule />}
              </TimelineDot>
              {index < timelineEvents.length - 1 && <TimelineConnector />}
            </TimelineSeparator>
            <TimelineContent>
              <Typography variant="h6" component="span">
                {event.status.replace('_', ' ').toUpperCase()}
              </Typography>
              <Typography color="text.secondary">
                {formatDate(event.timestamp)}
              </Typography>
              {event.note && (
                <Typography variant="body2" color="text.secondary">
                  {event.note}
                </Typography>
              )}
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    );
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !order) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error || 'Bulk order not found'}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 3 }}>
        <Link component={RouterLink} to="/" underline="hover">
          Home
        </Link>
        <Link component={RouterLink} to="/bulk-orders" underline="hover">
          Bulk Orders
        </Link>
        <Typography color="text.primary">{order.teamName}</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/bulk-orders')}
          sx={{ mr: 2 }}
        >
          Back to Bulk Orders
        </Button>
        <Typography variant="h4" sx={{ fontWeight: 'bold', flexGrow: 1 }}>
          {order.teamName} - Jersey Order
        </Typography>
        <Chip
          icon={statusIcons[order.status]}
          label={order.status.replace('_', ' ').toUpperCase()}
          color={statusColors[order.status]}
          size="large"
        />
      </Box>

      <Grid container spacing={3}>
        {/* Order Details */}
        <Grid item xs={12} md={8}>
          {/* Team Information */}
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Team Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Team Name
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {order.teamName}
                </Typography>
                
                <Typography variant="subtitle2" color="text.secondary">
                  Contact Person
                </Typography>
                <Typography variant="body1">
                  {order.contactPerson?.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {order.contactPerson?.email}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {order.contactPerson?.phone}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Shipping Address
                </Typography>
                <Typography variant="body1">
                  {order.shippingAddress?.name}<br />
                  {order.shippingAddress?.street}<br />
                  {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Jersey Details */}
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Jersey Specifications
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Material
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  {order.jerseyDetails?.material}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Style
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  {order.jerseyDetails?.style}
                </Typography>
                
                <Typography variant="subtitle2" color="text.secondary">
                  Total Quantity
                </Typography>
                <Typography variant="body1">
                  {order.playerDetails?.length || 0} jerseys
                </Typography>
              </Grid>
            </Grid>

            {/* Size Breakdown */}
            {order.jerseyDetails?.sizes && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Size Breakdown
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {order.jerseyDetails.sizes.map((size, index) => (
                    <Chip
                      key={index}
                      label={`${size.size}: ${size.quantity}`}
                      variant="outlined"
                      size="small"
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Paper>

          {/* Player Details */}
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Player Details ({order.playerDetails?.length || 0})
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Player Name</TableCell>
                    <TableCell>Number</TableCell>
                    <TableCell>Size</TableCell>
                    <TableCell>Position</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.playerDetails?.map((player, index) => (
                    <TableRow key={index}>
                      <TableCell>{player.playerName}</TableCell>
                      <TableCell>{player.jerseyNumber}</TableCell>
                      <TableCell>{player.size}</TableCell>
                      <TableCell>{player.position || 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Custom Design */}
          {order.customDesign?.hasCustomDesign && (
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Custom Design
              </Typography>
              {order.customDesign.designFiles?.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Design Files
                  </Typography>
                  {order.customDesign.designFiles.map((file, index) => (
                    <Chip
                      key={index}
                      label={file.originalName}
                      icon={<Download />}
                      onClick={() => window.open(file.url, '_blank')}
                      sx={{ mr: 1, mb: 1 }}
                    />
                  ))}
                </Box>
              )}
              {order.customDesign.designNotes && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Design Notes
                  </Typography>
                  <Typography variant="body2">
                    {order.customDesign.designNotes}
                  </Typography>
                </Box>
              )}
            </Paper>
          )}

          {/* Order Timeline */}
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Order Timeline
            </Typography>
            {renderTimeline()}
          </Paper>
        </Grid>

        {/* Order Summary Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Order Summary */}
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Quantity:</Typography>
              <Typography>{order.playerDetails?.length || 0} jerseys</Typography>
            </Box>
            
            {order.pricing?.subtotal && (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Subtotal:</Typography>
                  <Typography>₹{order.pricing.subtotal.toFixed(2)}</Typography>
                </Box>

                {order.pricing.discount > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography color="success.main">Bulk Discount:</Typography>
                    <Typography color="success.main">-₹{order.pricing.discount.toFixed(2)}</Typography>
                  </Box>
                )}
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Total:
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    ₹{order.pricing.total.toFixed(2)}
                  </Typography>
                </Box>
              </>
            )}
            
            {!order.pricing?.total && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Pricing will be provided after review
              </Alert>
            )}
          </Paper>

          {/* Production Information */}
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Production Information
            </Typography>
            
            <Typography variant="body2" color="text.secondary">
              Order Date: {formatDate(order.createdAt)}
            </Typography>
            
            {order.estimatedDelivery && (
              <Typography variant="body2" color="text.secondary">
                Estimated Delivery: {formatDate(order.estimatedDelivery)}
              </Typography>
            )}
            
            {order.assignedTo && (
              <Typography variant="body2" color="text.secondary">
                Assigned to: {order.assignedTo.name}
              </Typography>
            )}
          </Paper>

          {/* Order Actions */}
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Order Actions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => window.print()}
                fullWidth
              >
                Print Order
              </Button>
              
              <Button
                variant="outlined"
                component={RouterLink}
                to="/bulk-orders"
                fullWidth
              >
                View All Orders
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default BulkOrderDetail;
