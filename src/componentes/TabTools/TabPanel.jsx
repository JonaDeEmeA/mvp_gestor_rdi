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
        height: '100%', 
        ...sx,
        // La lógica de visibilidad debe ir al final para mandatar sobre cualquier sx externo
        display: value === index ? (sx.display || 'flex') : 'none',
        flexDirection: sx.flexDirection || 'column',
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