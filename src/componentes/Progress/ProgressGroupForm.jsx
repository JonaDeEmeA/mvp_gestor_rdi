import { useState } from 'react';
import {
  Box, TextField, Button, Typography, Collapse,
} from '@mui/material';
import { BIM_COLORS } from '../../constants/designTokens';

const ProgressGroupForm = ({ show, onCancel, onSave }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onSave({ name: name.trim(), description: description.trim() });
      setName('');
      setDescription('');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Collapse in={show}>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          p: 2,
          border: `1px solid ${BIM_COLORS.neutral.border}`,
          borderRadius: 1,
          bgcolor: BIM_COLORS.neutral.background.secondary,
          mb: 2,
        }}
      >
        <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 'bold' }}>
          Nuevo Grupo de Avance
        </Typography>

        <TextField
          fullWidth
          size="small"
          label="Nombre del grupo"
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{ mb: 1.5 }}
          autoFocus
        />

        <TextField
          fullWidth
          size="small"
          label="Descripción (opcional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          multiline
          rows={2}
          sx={{ mb: 2 }}
        />

        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          <Button size="small" variant="outlined" onClick={onCancel}>
            Cancelar
          </Button>
          <Button
            size="small"
            variant="contained"
            type="submit"
            disabled={!name.trim() || saving}
            sx={{ bgcolor: BIM_COLORS.accent.main, '&:hover': { bgcolor: BIM_COLORS.accent.active } }}
          >
            {saving ? 'Guardando...' : 'Crear Grupo'}
          </Button>
        </Box>
      </Box>
    </Collapse>
  );
};

export default ProgressGroupForm;
