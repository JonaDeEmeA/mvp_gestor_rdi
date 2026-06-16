import { useState } from 'react';
import {
  Box, TextField, Button, Typography, Collapse, Select, MenuItem, FormControl, InputLabel,
  Switch, FormControlLabel, Grid, FormHelperText,
} from '@mui/material';
import { BIM_COLORS } from '../../constants/designTokens';
import { WEIGHT_UNITS, DEFAULT_WEIGHT, WEIGHT_HELPERS, formatWeight } from '../../constants/progressStandards';

const ProgressGroupForm = ({ show, onCancel, onSave, existingGroups = [] }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [weight, setWeight] = useState(DEFAULT_WEIGHT);
  const [weightUnit, setWeightUnit] = useState('porcentaje');
  const [isCritical, setIsCritical] = useState(false);
  const [parentId, setParentId] = useState('');
  const [saving, setSaving] = useState(false);
  const [weightError, setWeightError] = useState('');

  const validateWeight = (value) => {
    const num = Number(value);
    if (isNaN(num) || num <= 0) {
      setWeightError('El peso debe ser mayor a 0');
      return false;
    }
    setWeightError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    const numWeight = Number(weight);
    if (!validateWeight(numWeight)) return;
    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        description: description.trim(),
        weight: numWeight,
        weightUnit,
        isCritical,
        parentId: parentId || null,
      });
      setName('');
      setDescription('');
      setWeight(DEFAULT_WEIGHT);
      setWeightUnit('porcentaje');
      setIsCritical(false);
      setParentId('');
    } finally {
      setSaving(false);
    }
  };

  const canSubmit = name.trim() && !weightError && Number(weight) > 0;

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

        <Grid container spacing={1.5} sx={{ mb: 1 }}>
          <Grid item xs={6}>
            <TextField
              fullWidth
              size="small"
              label="Peso"
              type="number"
              value={weight}
              onChange={(e) => {
                setWeight(e.target.value);
                if (e.target.value) validateWeight(e.target.value);
              }}
              error={!!weightError}
              helperText={weightError}
              inputProps={{ min: 0.01, step: 0.1 }}
            />
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Unidad</InputLabel>
              <Select
                value={weightUnit}
                label="Unidad"
                onChange={(e) => {
                  setWeightUnit(e.target.value);
                  setWeight(DEFAULT_WEIGHT);
                }}
              >
                {WEIGHT_UNITS.map((u) => (
                  <MenuItem key={u.value} value={u.value}>{u.label}</MenuItem>
                ))}
              </Select>
              <FormHelperText>
                {formatWeight(weight, weightUnit)}
              </FormHelperText>
            </FormControl>
          </Grid>
        </Grid>

        <Typography variant="caption" sx={{ color: BIM_COLORS.neutral.text.secondary, display: 'block', mb: 1.5, px: 0.5, fontStyle: 'italic' }}>
          {WEIGHT_HELPERS[weightUnit] || 'Define la importancia relativa del grupo en el proyecto.'}
        </Typography>

        <FormControlLabel
          control={
            <Switch
              checked={isCritical}
              onChange={(e) => setIsCritical(e.target.checked)}
              size="small"
            />
          }
          label="Crítico"
          sx={{ mb: 1.5, '& .MuiTypography-root': { fontSize: '0.8rem', color: BIM_COLORS.neutral.text.secondary } }}
        />

        {existingGroups.length > 0 && (
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Grupo padre (opcional)</InputLabel>
            <Select
              value={parentId}
              label="Grupo padre (opcional)"
              onChange={(e) => setParentId(e.target.value)}
            >
              <MenuItem value=""><em>Ninguno (raíz)</em></MenuItem>
              {existingGroups.map((g) => (
                <MenuItem key={g.id} value={g.id}>{g.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          <Button size="small" variant="outlined" onClick={onCancel}>
            Cancelar
          </Button>
          <Button
            size="small"
            variant="contained"
            type="submit"
            disabled={!canSubmit || saving}
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
