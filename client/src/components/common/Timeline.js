import React from 'react';
import { Box, Avatar } from '@mui/material';

export const Timeline = ({ children, ...props }) => (
  <Box sx={{ position: 'relative', pl: 2 }} {...props}>
    {children}
  </Box>
);

export const TimelineItem = ({ children, ...props }) => (
  <Box sx={{ position: 'relative', pb: 3, '&:last-child': { pb: 0 } }} {...props}>
    {children}
  </Box>
);

export const TimelineSeparator = ({ children, ...props }) => (
  <Box
    sx={{
      position: 'absolute',
      left: -16,
      top: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      height: '100%'
    }}
    {...props}
  >
    {children}
  </Box>
);

export const TimelineDot = ({ children, color = 'primary', ...props }) => (
  <Avatar
    sx={{
      width: 32,
      height: 32,
      bgcolor: `${color}.main`,
      color: `${color}.contrastText`,
      fontSize: '1rem'
    }}
    {...props}
  >
    {children}
  </Avatar>
);

export const TimelineConnector = ({ ...props }) => (
  <Box
    sx={{
      width: 2,
      flex: 1,
      bgcolor: 'divider',
      mt: 1,
      minHeight: 24
    }}
    {...props}
  />
);

export const TimelineContent = ({ children, ...props }) => (
  <Box sx={{ ml: 4, mt: -0.5 }} {...props}>
    {children}
  </Box>
);
