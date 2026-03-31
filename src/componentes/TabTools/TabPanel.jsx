import React from 'react';
import { Box } from '@mui/material';

const TabPanel = ({
  children,
  value,
  index,
  sx = {},
  ...other
}) => {
  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      sx={{
        display: value === index ? 'flex' : 'none',
        flexDirection: 'column',
        // Si se pasa flex en sx lo tomará, de lo contrario no crecerá por defecto
        height: '100%', 
        ...sx
      }}
      {...other}
    >
      {value === index && children}
    </Box>
  );
};

// Helper function para generar props de accesibilidad para tabs
export const a11yProps = (index) => {
  return {
    id: `tab-${index}`,
    'aria-controls': `tabpanel-${index}`,
  };
};

export default TabPanel;