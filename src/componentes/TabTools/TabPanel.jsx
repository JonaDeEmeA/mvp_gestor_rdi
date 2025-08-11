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
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
      style={{ height: "90%" }}
    >
      {value === index && (
        <Box 
          sx={{ 
            p: 2, 
            height: "100%",
            ...sx
          }}
        >
          {children}
        </Box>
      )}
    </div>
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