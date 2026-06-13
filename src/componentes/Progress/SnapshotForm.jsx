import { useState } from 'react';
import {
  Box, Slider, TextField, Button, Typography, Paper,
} from '@mui/material';
import { BIM_COLORS } from '../../constants/designTokens';

const SnapshotForm = ({ currentProgress, onSave, onCancel }) => {
  const [progress, setProgress] = useState(currentProgress || 0);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(progress, comment.trim());
      setComment('');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        mb: 2,
        bgcolor: BIM_COLORS.neutral.background.secondary,
        borderColor: BIM_COLORS.neutral.border,
      }}
    >
      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1.5, color: BIM_COLORS.neutral.text.primary }}>
        Registrar Avance
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        <Box sx={{ px: 1, mb: 2 }}>
          <Typography variant="caption" sx={{ color: BIM_COLORS.neutral.text.secondary, mb: 1, display: 'block' }}>
            Porcentaje de avance: <strong>{progress}%</strong>
          </Typography>
          <Slider
            value={progress}
            onChange={(e, val) => setProgress(val)}
            min={0}
            max={100}
            step={5}
            valueLabelDisplay="auto"
            valueLabelFormat={(val) => `${val}%`}
            sx={{
              color: BIM_COLORS.primary.active,
              '& .MuiSlider-thumb': {
                width: 16,
                height: 16,
              },
            }}
          />
        </Box>

        <TextField
          fullWidth
          size="small"
          label="Comentario (opcional)"
          placeholder="Describe el avance registrado..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          multiline
          rows={2}
          sx={{ mb: 2 }}
          inputProps={{ maxLength: 500 }}
        />

        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          {onCancel && (
            <Button size="small" variant="outlined" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button
            size="small"
            variant="contained"
            type="submit"
            disabled={saving}
            sx={{
              bgcolor: BIM_COLORS.accent.main,
              '&:hover': { bgcolor: BIM_COLORS.accent.active },
            }}
          >
            {saving ? 'Guardando...' : 'Guardar Avance'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default SnapshotForm;
