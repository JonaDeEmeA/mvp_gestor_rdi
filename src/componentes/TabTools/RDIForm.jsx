import React from 'react';
import { BIM_COLORS } from '../../constants/designTokens';
import { Box, Typography, FormControl, InputLabel, Select, MenuItem, TextField, Button, Collapse } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const RDIForm = ({
  showForm,
  formData,
  onFormChange,
  onAccept,
  onCancel,
  bcfTopicSet,
  isEditing,
  snapshotUrl,
  snapShotReady,
  onCreateViewpoint,
  onUpdateSnapshot,
  onVerSnapshotPV,
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onAccept();
  };

  const validateForm = () => {
    return formData.tipo && formData.titulo && formData.fecha && formData.estado;
  };

  const textFieldStyles = {
    mb: 2,
    '& .MuiInputBase-root': { fontSize: '0.85rem' },
    '& .MuiInputLabel-root': { fontSize: '0.85rem' },
    bgcolor: 'white'
  };

  return (
    <Collapse in={showForm}>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          p: 2,
          border: `1px solid ${BIM_COLORS.neutral.border}`,
          borderRadius: 1,
          bgcolor: BIM_COLORS.neutral.background.secondary
        }}
      >
        {/* Snapshot Display */}
        {snapshotUrl && (
          <Box sx={{ mb: 2, textAlign: 'center', position: 'relative' }}>
            <img
              src={snapshotUrl}
              alt="Viewpoint Snapshot"
              style={{
                maxWidth: '100%',
                maxHeight: '180px',
                borderRadius: '4px',
                border: `1px solid ${BIM_COLORS.neutral.border}`,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            />
          </Box>
        )}

        {/* Snapshot Controls */}
        {showForm && (
          <Box display="flex" gap={1} sx={{ mb: 3 }}>
            {!snapShotReady ? (
              <Button
                variant="contained"
                onClick={onCreateViewpoint}
                fullWidth
                size="small"
                sx={{
                  bgcolor: BIM_COLORS.primary.main,
                  textTransform: 'none',
                  fontWeight: 'bold',
                  '&:hover': { bgcolor: BIM_COLORS.primary.active }
                }}
              >
                Agregar Captura
              </Button>
            ) : (
              <>
                <Button
                  variant="outlined"
                  onClick={onUpdateSnapshot}
                  fullWidth
                  size="small"
                  sx={{
                    color: BIM_COLORS.primary.main,
                    borderColor: BIM_COLORS.primary.main,
                    textTransform: 'none',
                    fontWeight: 'bold',
                    fontSize: '0.75rem'
                  }}
                >
                  Actualizar
                </Button>
                <Button
                  disabled={!isEditing}
                  variant="outlined"
                  onClick={onVerSnapshotPV}
                  fullWidth
                  size="small"
                  sx={{
                    color: BIM_COLORS.primary.main,
                    borderColor: BIM_COLORS.primary.main,
                    textTransform: 'none',
                    fontWeight: 'bold',
                    fontSize: '0.75rem'
                  }}
                >
                  Ver
                </Button>
              </>
            )}
          </Box>
        )}

        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold', color: BIM_COLORS.primary.main }}>
          {isEditing ? "Editar Registro de Información" : "Nuevo Registro de Información"}
        </Typography>

        {/* Campo Título */}
        <TextField
          size="small"
          fullWidth
          label="Título"
          required
          value={formData.titulo}
          onChange={(e) => onFormChange("titulo", e.target.value)}
          sx={textFieldStyles}
        />

        {/* Campo Descripción */}
        <TextField
          size="small"
          fullWidth
          label="Descripción"
          multiline
          rows={3}
          value={formData.descripcion}
          onChange={(e) => onFormChange("descripcion", e.target.value)}
          sx={textFieldStyles}
        />

        {/* Select Tipo */}
        <FormControl fullWidth sx={textFieldStyles} size="small" required variant="outlined">
          <InputLabel>Tipo</InputLabel>
          <Select
            value={formData.tipo}
            label="Tipo"
            onChange={(e) => onFormChange("tipo", e.target.value)}
            sx={{ fontSize: '0.85rem' }}
          >
            {Array.from(bcfTopicSet.types || []).map((tipo) => (
              <MenuItem key={tipo} value={tipo} sx={{ fontSize: '0.85rem' }}>
                {tipo}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Select Especialidad */}
        <FormControl fullWidth sx={textFieldStyles} size="small" variant="outlined">
          <InputLabel>Especialidad</InputLabel>
          <Select
            value={formData.etiqueta}
            label="Especialidad"
            onChange={(e) => onFormChange("etiqueta", e.target.value)}
            sx={{ fontSize: '0.85rem' }}
          >
            {Array.from(bcfTopicSet.labels || []).map((esp) => (
              <MenuItem key={esp} value={esp} sx={{ fontSize: '0.85rem' }}>
                {esp}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Select Estado */}
        <FormControl fullWidth sx={textFieldStyles} size="small" required variant="outlined">
          <InputLabel>Estado</InputLabel>
          <Select
            value={formData.estado}
            label="Estado"
            onChange={(e) => onFormChange("estado", e.target.value)}
            sx={{ fontSize: '0.85rem' }}
          >
            {Array.from(bcfTopicSet.statuses || []).map((estado) => (
              <MenuItem key={estado} value={estado} sx={{ fontSize: '0.85rem' }}>
                {estado}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* DatePicker Fecha */}
        <DatePicker
          label="Fecha"
          value={formData.fecha}
          onChange={(newValue) => onFormChange("fecha", newValue)}
          slotProps={{
            textField: {
              size: 'small',
              fullWidth: true,
              required: true,
              sx: textFieldStyles,
            },
          }}
        />

        {/* Botones de acción del formulario */}
        <Box sx={{ display: "flex", gap: 1, mt: 3 }}>
          <Button
            variant="outlined"
            onClick={onCancel}
            fullWidth
            sx={{
              color: BIM_COLORS.neutral.text.secondary,
              borderColor: BIM_COLORS.neutral.border,
              textTransform: 'none',
              fontWeight: 'bold',
              '&:hover': { borderColor: BIM_COLORS.neutral.text.secondary, bgcolor: BIM_COLORS.neutral.background.main }
            }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            type="submit"
            disabled={!validateForm()}
            fullWidth
            sx={{
              bgcolor: BIM_COLORS.primary.main,
              textTransform: 'none',
              fontWeight: 'bold',
              '&:hover': { bgcolor: BIM_COLORS.primary.active }
            }}
          >
            {isEditing ? "Guardar" : "Crear RDI"}
          </Button>
        </Box>
      </Box>
    </Collapse>
  );
};

export default RDIForm;