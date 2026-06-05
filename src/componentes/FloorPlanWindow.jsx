import React from 'react';
import {
  Box,
  Typography,
  Button,
  Slider,
  Stack,
  Paper,
  CircularProgress,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import FloatingWindow from './FloatingWindow';
import { BIM_COLORS } from '../constants/designTokens';

const FloorPlanWindow = ({
  open,
  onClose,
  level,
  onLevelChange,
  imageUrl,
  generating,
  error,
  onGenerate,
  onExport,
}) => {
  return (
    <FloatingWindow
      open={open}
      onClose={onClose}
      title="Planos 2D"
      width="360px"
      height="520px"
    >
      <Stack spacing={2}>
        <Box>
          <Typography variant="caption" sx={{ color: BIM_COLORS.neutral.text.secondary, fontWeight: 'bold', display: 'block', mb: 1 }}>
            Altura de corte: {level.toFixed(1)} m
          </Typography>
          <Slider
            value={level}
            onChange={(_, val) => onLevelChange(val)}
            min={0.5}
            max={5.0}
            step={0.1}
            valueLabelDisplay="auto"
            valueLabelFormat={(v) => `${v.toFixed(1)}m`}
            sx={{
              color: BIM_COLORS.primary.main,
              '& .MuiSlider-thumb': { width: 16, height: 16 },
            }}
          />
        </Box>

        <Button
          variant="contained"
          onClick={onGenerate}
          disabled={generating}
          fullWidth
          startIcon={generating ? <CircularProgress size={18} color="inherit" /> : <ImageIcon />}
          sx={{
            bgcolor: BIM_COLORS.primary.main,
            textTransform: 'none',
            fontWeight: 'bold',
            '&:hover': { bgcolor: BIM_COLORS.primary.active },
            py: 1,
          }}
        >
          {generating ? 'Generando...' : 'Generar Plano'}
        </Button>

        {error && (
          <Typography variant="caption" sx={{ color: BIM_COLORS.status.error.main, textAlign: 'center' }}>
            {error}
          </Typography>
        )}

        {imageUrl && (
          <>
            <Paper
              variant="outlined"
              sx={{
                borderRadius: 1,
                borderColor: BIM_COLORS.neutral.border,
                overflow: 'hidden',
                bgcolor: '#181818',
              }}
            >
              <img
                src={imageUrl}
                alt="Floor Plan"
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                  maxHeight: '280px',
                  objectFit: 'contain',
                }}
              />
            </Paper>

            <Button
              variant="outlined"
              onClick={onExport}
              fullWidth
              startIcon={<DownloadIcon />}
              sx={{
                color: BIM_COLORS.primary.main,
                borderColor: BIM_COLORS.primary.main,
                textTransform: 'none',
                fontWeight: 'bold',
                '&:hover': { borderColor: BIM_COLORS.primary.active },
              }}
            >
              Exportar PNG
            </Button>
          </>
        )}

        {!imageUrl && !generating && !error && (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <ImageIcon sx={{ fontSize: 48, color: BIM_COLORS.neutral.text.disabled, mb: 1 }} />
            <Typography variant="body2" sx={{ color: BIM_COLORS.neutral.text.secondary }}>
              Ajusta la altura de corte y genera el plano 2D del modelo.
            </Typography>
          </Box>
        )}
      </Stack>
    </FloatingWindow>
  );
};

export default FloorPlanWindow;
