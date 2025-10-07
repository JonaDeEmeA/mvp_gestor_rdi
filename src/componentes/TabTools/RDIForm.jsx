import React from 'react';
import {
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Collapse,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const inputStyles = {
  fontSize: '0.75rem',
  height: '32px'
};

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

  return (
    <Collapse in={showForm}>
      <Box 
        component="form" 
        onSubmit={handleSubmit}
        sx={{ p: 2, border: "1px solid #e0e0e0", borderRadius: 1 }}
      >
        {/* Snapshot Display */}
        {snapshotUrl && (
          <Box sx={{ mb: 2, textAlign: 'center' }}>
            <img
              src={snapshotUrl}
              alt="Viewpoint Snapshot"
              style={{ 
                maxWidth: '100%', 
                maxHeight: '200px',
                borderRadius: '4px',
                border: '1px solid #e0e0e0'
              }}
            />
          </Box>
        )}

        {/* Snapshot Controls */}
        {showForm && (
          <Box 
          display="flex" 
          flexDirection="row"
          sx={{ mb: 2 }}>
            {!snapShotReady ? (
              <Button 
                variant="outlined" 
                color="primary" 
                onClick={onCreateViewpoint} 
                fullWidth
                size="small"
              >
                AGREGAR SNAPSHOT
              </Button>
            ) : (
              <>
              <Button 
                 sx={{
                    fontSize: '0.60rem',
                    padding: '2px 4px',
                    minWidth: 'auto',         // Permite ancho automático
                  }}
                variant="outlined" 
                color="secondary" 
                onClick={onUpdateSnapshot} 
                fullWidth
                size="small"
              >
                ACTUALIZAR SNAPSHOT
              </Button>
              <Button
                sx={{
                  fontSize: '0.60rem',
                  padding: '2px 4px',
                  minWidth: 'auto',         // Permite ancho automático
                  ml: 1,                    // Margen izquierdo para separación
                }} 
                disabled={!isEditing}
                variant="outlined" 
                color="secondary" 
                onClick={onVerSnapshotPV} 
                fullWidth
                size="small"
              >
                VER
              </Button>
              </>
            )}
          </Box>
        )}

        <Typography variant="h6" sx={{ mb: 2 }}>
          {isEditing ? "Editar RDI" : "Nuevo RDI"}
        </Typography>

        {/* Campo Título */}
        <TextField
          size="small"
          fullWidth
          label="Título"
          required
          slotProps={{ input: { style: inputStyles } }}
          value={formData.titulo}
          onChange={(e) => onFormChange("titulo", e.target.value)}
          sx={{
            mb: 2, 
            '& .MuiInputLabel-root': { fontSize: '0.75rem' }
          }}
        />

        {/* Select Tipo */}
        <FormControl fullWidth sx={{ mb: 2 }} size="small" required>
          <InputLabel sx={inputStyles}>Tipo</InputLabel>
          <Select
            sx={inputStyles}
            value={formData.tipo}
            label="Tipo"
            onChange={(e) => onFormChange("tipo", e.target.value)}
          >
            {Array.from(bcfTopicSet.types || []).map((tipo) => (
              <MenuItem sx={inputStyles} key={tipo} value={tipo}>
                {tipo}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Select Especialidad */}
        <FormControl fullWidth sx={{ mb: 2 }} size="small">
          <InputLabel>Especialidad</InputLabel>
          <Select
            value={formData.etiqueta}
            label="Especialidad"
            onChange={(e) => onFormChange("etiqueta", e.target.value)}
          >
            {Array.from(bcfTopicSet.labels || []).map((esp) => (
              <MenuItem key={esp} value={esp}>
                {esp}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Select Estado */}
        <FormControl fullWidth sx={{ mb: 2 }} size="small" required>
          <InputLabel>Estado</InputLabel>
          <Select
            value={formData.estado}
            label="Estado"
            onChange={(e) => onFormChange("estado", e.target.value)}
          >
            {Array.from(bcfTopicSet.statuses || []).map((estado) => (
              <MenuItem key={estado} value={estado}>
                {estado}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Campo Descripción */}
        <TextField
          size="small"
          fullWidth
          label="Descripción"
          multiline
          rows={3}
          value={formData.descripcion}
          onChange={(e) => onFormChange("descripcion", e.target.value)}
          sx={{ mb: 2 }}
        />

        {/* DatePicker */}
        <DatePicker
          label="Fecha"
          value={formData.fecha}
          onChange={(newValue) => onFormChange("fecha", newValue)}
          slotProps={{
            textField: {
              fullWidth: true,
              required: true,
              sx: { mb: 2 },
            },
          }}
        />

        {/* Campo Comentario */}
        <TextField
          disabled
          size="small"
          fullWidth
          label="Comentario"
          multiline
          rows={3}
          value={formData.comentario}
          onChange={(e) => onFormChange("comentario", e.target.value)}
          sx={{ mb: 2 }}
          helperText="Este campo se habilitará en futuras versiones"
        />

        {/* Botones */}
        <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
          <Button 
            variant="outlined" 
            onClick={onCancel}
            type="button"
          >
            CANCELAR
          </Button>
          <Button 
            variant="contained" 
            type="submit"
            disabled={!validateForm()}
          >
            {isEditing ? "GUARDAR" : "ACEPTAR"}
          </Button>
        </Box>
      </Box>
    </Collapse>
  );
};

export default RDIForm;