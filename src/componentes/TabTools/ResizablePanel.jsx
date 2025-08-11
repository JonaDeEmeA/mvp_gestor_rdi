import React from 'react';
import { Box, Paper } from '@mui/material';
import { useResizable } from '../../hooks/useResizable';

const ResizablePanel = ({
  children,
  initialWidth = 20,
  minWidth = 20,
  maxWidth = 80,
  elevation = 3,
  sx = {},
  ...paperProps
}) => {
  const {
    width: paperWidth,
    isResizing,
    containerRef,
    handleMouseDown
  } = useResizable(initialWidth, minWidth, maxWidth);

  return (
    <Box ref={containerRef} sx={{ ...sx }}>
      <Paper
        elevation={elevation}
        sx={{
          minWidth: { xs: "100%", sm: "400px" },
          width: `${paperWidth}%`,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          position: "absolute",
          right: 0,
          top: { xs: "100%", sm: "auto" },
          pointerEvents: "auto",
          transition: isResizing ? "none" : "width 0.2s ease",
        }}
        {...paperProps}
      >
        {children}

        {/* Handle de redimensionamiento */}
        <Box
          onMouseDown={handleMouseDown}
          sx={{
            position: "absolute",
            top: 0,
            left: -2,
            width: 4,
            height: "100%",
            cursor: "col-resize",
            backgroundColor: "transparent",
            "&:hover": {
              backgroundColor: "primary.main",
              opacity: 0.3,
            },
            "&:active": {
              backgroundColor: "primary.main",
              opacity: 0.5,
            },
            zIndex: 1000,
          }}
        />
      </Paper>

      {/* Overlay durante el redimensionamiento */}
      {isResizing && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            cursor: "col-resize",
          }}
        />
      )}
    </Box>
  );
};

export default ResizablePanel;