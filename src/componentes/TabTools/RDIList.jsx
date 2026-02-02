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


        {/* Selector de filtro */}
        <FormControl variant="standard" size="small" fullWidth>
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
              const count = rdiList.filter(rdi => (rdi.tipo || rdi.types) === tipo).length;
              return (
                <MenuItem key={tipo} value={tipo}>
                  {tipo} ({count})
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>

        {/* Estadísticas del filtro */}
        <Box sx={{ pt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
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
                <Box sx={{ display: "flex", alignItems: "center" }}>
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
                      <strong>ID:</strong> {rdi.id}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" component="span" sx={{ display: 'block' }}>
                      <strong>Especialidad:</strong> {rdi.etiqueta || rdi.labels || "No definida"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" component="span" sx={{ display: 'block' }}>
                      <strong>Fecha:</strong> {rdi.fecha ? new Date(rdi.fecha).toLocaleDateString('es-ES') : 'No definida'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" component="span" sx={{ display: 'block' }}>
                      <strong>Estado:</strong> {rdi.estado || rdi.statuses || "No definido"}
                    </Typography>
                    {rdi.descripcion && (
                      <Typography variant="body2" color="text.secondary" component="span" sx={{ mt: 0.5, display: 'block' }}>
                        <strong>Descripción:</strong> {rdi.descripcion.length > 100
                          ? `${rdi.descripcion.substring(0, 100)}...`
                          : rdi.descripcion}
                      </Typography>
                    )}
                    {rdi.updatedAt && (
                      <Typography variant="caption" color="text.secondary" component="span" sx={{ mt: 0.5, display: 'block' }}>
                        Última actualización: {new Date(rdi.updatedAt).toLocaleString('es-ES')}
                      </Typography>
                    )}
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