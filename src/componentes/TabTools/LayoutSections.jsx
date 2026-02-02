import React from 'react';
import { Box, Paper, Divider } from '@mui/material';
import { LAYOUT_CONFIG } from './LayoutConfig';

// ✅ PASO 3.1: Header Section Component
export const HeaderSection = ({ children, ...props }) => {
  console.log('📦 PASO 3.1: Renderizando HeaderSection');
  
  return (
    <Paper
      elevation={0}
      sx={{
        ...LAYOUT_CONFIG.sections.header,
        flexShrink: 0,
        ...props.sx
      }}
      {...props}
    >
      {children}
    </Paper>
  );
};

// ✅ PASO 3.2: Content Section Component
export const ContentSection = ({ children, ...props }) => {
  console.log('📦 PASO 3.2: Renderizando ContentSection');
  
  return (
    <Box
      sx={{
        ...LAYOUT_CONFIG.sections.content,
        ...props.sx
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

// ✅ PASO 3.3: Footer Section Component
export const FooterSection = ({ children, ...props }) => {
  console.log('📦 PASO 3.3: Renderizando FooterSection');
  
  return (
    <Paper
      elevation={0}
      sx={{
        ...LAYOUT_CONFIG.sections.footer,
        flexShrink: 0,
        ...props.sx
      }}
      {...props}
    >
      {children}
    </Paper>
  );
};

console.log('✅ PASO 3 COMPLETADO: Componentes de sección creados');