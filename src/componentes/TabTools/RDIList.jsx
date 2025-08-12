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
import EditIcon from '@mui/icons-material/Edit';
import InfoIcon from '@mui/icons-material/Info';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

const RDIList = ({
  rdiList,
  filterTipo,
  onFilterChange,
  onEdit,
  onStatusChange,
  onInfo,
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
    <Box sx={{ flex: 1 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Lista de RDIs
      </Typography>

      {/* Selector de filtro */}
      <FormControl fullWidth size="small" sx={{ mb: 2 }}>
        <InputLabel>Filtrar por tipo</InputLabel>
        <Select
          value={filterTipo}
          label="Filtrar por tipo"
          onChange={(e) => onFilterChange(e.target.value)}
        >
          <MenuItem value="">
            <em>Todos ({totalCount})</em>
          </MenuItem>
          {Array.from(bcfTopicSet.types || []).map((tipo) => {
            const count = rdiList.filter(rdi => rdi.types === tipo).length;
            return (
              <MenuItem key={tipo} value={tipo}>
                {tipo} ({count})
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>

      {/* Estadísticas del filtro */}
      <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Chip 
          label={`Total: ${totalCount}`} 
          size="small" 
          color="primary" 
          variant="outlined"
        />
        {filterTipo && (
          <Chip 
            label={`Filtrados: ${rdiList.length}`} 
            size="small" 
            color="secondary" 
            variant="outlined"
          />
        )}
      </Box>

      {/* Lista de RDIs */}
      <List sx={{ maxHeight: '400px', overflow: 'auto' }}>
        {rdiList.map((rdi) => (
          <ListItem
            key={rdi.id}
            divider
            sx={{
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
            secondaryAction={
              <Box sx={{ display: "flex", alignItems: "center" }}>
                {/* Selector editable de estado */}
                <FormControl size="small" sx={{ minWidth: 120, mr: 1 }}>
                  <InputLabel>Estado</InputLabel>
                  <Select
                    value={rdi.statuses || ""}
                    label="Estado"
                    onChange={(e) => onStatusChange(rdi.id, e.target.value)}
                  >
                    {Array.from(bcfTopicSet.statuses || []).map((estado) => (
                      <MenuItem key={estado} value={estado}>
                        {estado}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Botón Exportar a BCF */}
                <IconButton
                  edge="end"
                  aria-label="export-bcf"
                  onClick={() => onExportToBCF(rdi.id)}
                  size="small"
                  title="Exportar a formato BCF"
                  color="success"
                >
                  <FileDownloadIcon />
                </IconButton>

                {/* Botón Info */}
                <IconButton
                  edge="end"
                  aria-label="info"
                  onClick={() => onInfo(rdi)}
                  size="small"
                  title="Ver información detallada"
                  sx={{ ml: 1 }}
                >
                  <InfoIcon />
                </IconButton>

                {/* Botón Editar */}
                <IconButton
                  edge="end"
                  aria-label="edit"
                  onClick={() => onEdit(rdi)}
                  size="small"
                  sx={{ ml: 1 }}
                  title="Editar RDI"
                >
                  <EditIcon />
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
                    label={rdi.types || "Sin tipo"} 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                  />
                </Box>
              }
              secondary={
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" color="text.secondary" component="div">
                    <strong>ID:</strong> {rdi.id}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" component="div">
                    <strong>Especialidad:</strong> {rdi.labels || "No definida"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" component="div">
                    <strong>Fecha:</strong> {rdi.fecha}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" component="div">
                    <strong>Estado:</strong> {rdi.statuses || "No definido"}
                  </Typography>
                  {rdi.descripcion && (
                    <Typography variant="body2" color="text.secondary" component="div" sx={{ mt: 0.5 }}>
                      <strong>Descripción:</strong> {rdi.descripcion.length > 100 
                        ? `${rdi.descripcion.substring(0, 100)}...` 
                        : rdi.descripcion}
                    </Typography>
                  )}
                  {rdi.updatedAt && (
                    <Typography variant="caption" color="text.secondary" component="div" sx={{ mt: 0.5 }}>
                      Última actualización: {new Date(rdi.updatedAt).toLocaleString('es-ES')}
                    </Typography>
                  )}
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>

      {/* Resumen de estados */}
      <Box sx={{ mt: 2, p: 1, backgroundColor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          Estados: {Array.from(bcfTopicSet.statuses || []).map(estado => {
            const count = rdiList.filter(rdi => rdi.statuses === estado).length;
            return count > 0 ? `${estado}: ${count}` : null;
          }).filter(Boolean).join(' | ') || 'Sin datos'}
        </Typography>
      </Box>
    </Box>
  );
};

export default RDIList;