import React from 'react';
import { BIM_COLORS } from '../../constants/designTokens';
import { Box, Typography, FormControl, InputLabel, Select, MenuItem, TextField, Button, Collapse, Divider, Stack, Avatar, Paper } from '@mui/material';
import { ChatBubbleOutline as CommentIcon, Send as SendIcon } from '@mui/icons-material';
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
  onAddComment,
}) => {
  const [newComment, setNewComment] = React.useState("");

  const handleAddCommentLocal = () => {
    if (!newComment.trim()) return;
    onAddComment(newComment);
    setNewComment("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAccept();
  };

  const validateForm = () => {
    return formData.tipo && formData.titulo && formData.dueDate && formData.estado;
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
        
        {/* Campo Asignado a */}
        <TextField
          size="small"
          fullWidth
          label="Asignado a"
          value={formData.assignedTo || ""}
          onChange={(e) => onFormChange("assignedTo", e.target.value)}
          sx={textFieldStyles}
          placeholder="ejemplo@correo.com"
        />

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

        {/* DatePicker Fecha Límite */}
        <DatePicker
          label="Fecha Límite"
          value={formData.dueDate}
          onChange={(newValue) => onFormChange("dueDate", newValue)}
          slotProps={{
            textField: {
              size: 'small',
              fullWidth: true,
              required: true,
              sx: textFieldStyles,
            },
          }}
        />

        {/* SECCIÓN DE COMENTARIOS (Solo en Edición) */}
        {isEditing && (
          <Box sx={{ mt: 4, mb: 2 }}>
            <Divider sx={{ mb: 3, borderColor: BIM_COLORS.neutral.border }} />
            
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
              <CommentIcon sx={{ fontSize: 18, color: BIM_COLORS.primary.main }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: BIM_COLORS.primary.main }}>
                Comentarios y Respuestas
              </Typography>
            </Stack>

            {/* Input para nuevo comentario */}
            <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
              <TextField
                size="small"
                fullWidth
                placeholder="Escribe un comentario..."
                multiline
                rows={2}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                sx={{
                  bgcolor: 'white',
                  '& .MuiInputBase-root': { fontSize: '0.85rem' }
                }}
              />
              <Button
                variant="contained"
                onClick={handleAddCommentLocal}
                disabled={!newComment.trim()}
                sx={{
                  minWidth: 'auto',
                  px: 2,
                  bgcolor: BIM_COLORS.primary.main,
                  '&:hover': { bgcolor: BIM_COLORS.primary.active }
                }}
              >
                <SendIcon fontSize="small" />
              </Button>
            </Box>

            {/* Historial de comentarios en el formulario */}
            {formData.comments && formData.comments.length > 0 && (
              <Stack spacing={2} sx={{ maxHeight: '300px', overflowY: 'auto', pr: 1 }}>
                {formData.comments.map((comment, index) => (
                  <Box key={comment.guid || index} sx={{ display: 'flex', gap: 1 }}>
                    <Avatar sx={{ 
                      width: 24, 
                      height: 24, 
                      bgcolor: BIM_COLORS.neutral.background.main,
                      color: BIM_COLORS.neutral.text.secondary,
                      fontSize: '0.6rem',
                      border: `1px solid ${BIM_COLORS.neutral.border}`
                    }}>
                      {comment.author?.charAt(0).toUpperCase() || 'U'}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.2 }}>
                        <Typography variant="caption" sx={{ fontWeight: 'bold', fontSize: '0.7rem' }}>
                          {comment.author}
                        </Typography>
                        <Typography variant="caption" sx={{ color: BIM_COLORS.neutral.text.secondary, fontSize: '0.6rem' }}>
                          {new Date(comment.date).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Paper 
                        elevation={0} 
                        sx={{ 
                          p: 1, 
                          bgcolor: 'white', 
                          border: `1px solid ${BIM_COLORS.neutral.border}`,
                          borderRadius: '0 8px 8px 8px'
                        }}
                      >
                        <Typography variant="body2" sx={{ fontSize: '0.8rem', color: BIM_COLORS.neutral.text.primary }}>
                          {comment.comment}
                        </Typography>
                      </Paper>
                    </Box>
                  </Box>
                ))}
              </Stack>
            )}
          </Box>
        )}

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