import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  Typography,
  IconButton,
  Chip,
} from '@mui/material';
import PreviewIcon from '@mui/icons-material/Preview';
import DeleteIcon from '@mui/icons-material/Delete';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

const RDIList = ({
  rdiList,
  filterTipo,
  onFilterChange,
  filterEstado,
  onFilterEstadoChange,
  onEdit,
  onStatusChange,
  onDelete,
  onExportToBCF,
  bcfTopicSet,
  totalCount,
}) => {
  if (totalCount === 0) {
    return (
      <Box sx={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '200px'
      }}>
        <Typography variant="body1" color="text.secondary">
          No hay RDIs creados aún
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Sección fija superior - Título y filtros */}
      <Box sx={{
        flexShrink: 0,
        pb: 2,
        borderBottom: '1px solid',
        borderColor: 'divider',
        mb: 2
      }}>


        {/* Selectores de filtro */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl variant="standard" size="small" fullWidth>
            <InputLabel>Filtrar por tipo</InputLabel>
            <Select
              value={filterTipo}
              label="Filtrar por tipo"
              onChange={(e) => onFilterChange(e.target.value)}
            >
              <MenuItem value="">
                <em>Todos</em>
              </MenuItem>
              {Array.from(bcfTopicSet.types || []).map((tipo) => (
                <MenuItem key={tipo} value={tipo}>
                  {tipo}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl variant="standard" size="small" fullWidth>
            <InputLabel>Filtrar por estado</InputLabel>
            <Select
              value={filterEstado}
              label="Filtrar por estado"
              onChange={(e) => onFilterEstadoChange(e.target.value)}
            >
              <MenuItem value="">
                <em>Todos</em>
              </MenuItem>
              {Array.from(bcfTopicSet.statuses || []).map((estado) => (
                <MenuItem key={estado} value={estado}>
                  {estado}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Estadísticas del filtro */}
        <Box sx={{ pt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            label={`Total: ${totalCount}`}
            size="small"
            color="primary"
            variant="outlined"
          />
          {(filterTipo || filterEstado) && (
            <Chip
              label={`Filtrados: ${rdiList.length}`}
              size="small"
              color="secondary"
              variant="outlined"
            />
          )}
        </Box>
      </Box>

      {/* Sección scrolleable - Lista de RDIs */}
      <Box sx={{
        flex: 1,           // Toma todo el espacio disponible
        overflow: 'hidden', // Evita overflow del contenedor
        display: 'flex',
        flexDirection: 'column'
      }}>
        <List sx={{
          flex: 1,
          overflow: 'auto',  // Solo esta sección hace scroll
          '& .MuiListItem-root': {
            borderRadius: 1,
            mb: 1,
            '&:hover': {
              backgroundColor: 'action.hover',
            },
          }
        }}>
          {rdiList.map((rdi) => (
            <ListItem
              key={rdi.id}
              divider
              secondaryAction={
                <Box sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 0,
                  alignItems: 'center',
                  ml: 2
                }}>
                  {/* Botón Exportar a BCF */}
                  <IconButton
                    aria-label="export-bcf"
                    onClick={() => onExportToBCF(rdi.id)}
                    size="small"
                    title="Exportar a formato BCF"
                    color="success"
                  >
                    <FileDownloadIcon fontSize="small" />
                  </IconButton>

                  {/* Botón Eliminar */}
                  <IconButton
                    aria-label="delete"
                    onClick={() => onDelete(rdi.id)}
                    size="small"
                    title="Eliminar RDI"
                    color="error"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>

                  {/* Botón Editar / Preview */}
                  <IconButton
                    aria-label="edit"
                    onClick={() => onEdit(rdi)}
                    size="small"
                    title="Ver RDI"
                  >
                    <PreviewIcon fontSize="small" />
                  </IconButton>
                </Box>
              }
            >
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                      {rdi.titulo}
                    </Typography>
                    <Chip
                      label={rdi.tipo || rdi.types || "Sin tipo"}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                }
                secondary={
                  <Box component="span" sx={{ mt: 1, display: 'block' }}>
                    <Typography variant="body2" color="text.secondary" component="span" sx={{ display: 'block' }}>
                      <strong>Especialidad:</strong> {rdi.etiqueta || rdi.labels || "No definida"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" component="span" sx={{ display: 'block' }}>
                      <strong>Asignado a:</strong> {rdi.assignedTo || "No asignado"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" component="span" sx={{ display: 'block' }}>
                      <strong>Fecha:</strong> {(() => {
                        if (!rdi.fecha) return 'No definida';
                        if (typeof rdi.fecha === 'string' && rdi.fecha.includes('/')) return rdi.fecha;
                        const date = new Date(rdi.fecha);
                        return isNaN(date.getTime()) ? 'Fecha inválida' : date.toLocaleDateString('es-ES');
                      })()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" component="span" sx={{ display: 'block' }}>
                      <strong>Estado:</strong> {rdi.estado || rdi.statuses || "No definido"}
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Sección fija inferior - Resumen de estados */}
      <Box sx={{
        flexShrink: 0,  // No se encoge
        mt: 2,
        p: 1,
        backgroundColor: 'grey.50',
        borderRadius: 1,
        borderTop: '1px solid',
        borderColor: 'divider'
      }}>
        <Typography variant="caption" color="text.secondary">
          Estados: {Array.from(bcfTopicSet.statuses || []).map(estado => {
            const count = rdiList.filter(rdi => (rdi.estado || rdi.statuses) === estado).length;
            return count > 0 ? `${estado}: ${count}` : null;
          }).filter(Boolean).join(' | ') || 'Sin datos'}
        </Typography>
      </Box>
    </Box>
  );
};

export default RDIList;