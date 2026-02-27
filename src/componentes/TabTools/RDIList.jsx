import { BIM_COLORS } from '../../constants/designTokens';
import { Box, Typography, FormControl, InputLabel, Select, MenuItem, ListItem, ListItemText, ListItemIcon, IconButton, Chip, List } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PreviewIcon from '@mui/icons-material/Preview';
import DeleteIcon from '@mui/icons-material/Delete';

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
        <Typography variant="body1" sx={{ color: BIM_COLORS.neutral.text.secondary }}>
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
        borderBottom: `1px solid ${BIM_COLORS.neutral.border}`,
        mb: 2
      }}>
        {/* Selectores de filtro */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl variant="outlined" size="small" fullWidth sx={{ bgcolor: 'white' }}>
            <InputLabel sx={{ fontSize: '0.8rem' }}>Tipo</InputLabel>
            <Select
              value={filterTipo}
              label="Tipo"
              onChange={(e) => onFilterChange(e.target.value)}
              sx={{ fontSize: '0.8rem' }}
            >
              <MenuItem value="" sx={{ fontSize: '0.8rem' }}><em>Todos</em></MenuItem>
              {Array.from(bcfTopicSet.types || []).map((tipo) => (
                <MenuItem key={tipo} value={tipo} sx={{ fontSize: '0.8rem' }}>{tipo}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl variant="outlined" size="small" fullWidth sx={{ bgcolor: 'white' }}>
            <InputLabel sx={{ fontSize: '0.8rem' }}>Estado</InputLabel>
            <Select
              value={filterEstado}
              label="Estado"
              onChange={(e) => onFilterEstadoChange(e.target.value)}
              sx={{ fontSize: '0.8rem' }}
            >
              <MenuItem value="" sx={{ fontSize: '0.8rem' }}><em>Todos</em></MenuItem>
              {Array.from(bcfTopicSet.statuses || []).map((estado) => (
                <MenuItem key={estado} value={estado} sx={{ fontSize: '0.8rem' }}>{estado}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Estadísticas del filtro */}
        <Box sx={{ pt: 1.5, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            label={`Total: ${totalCount}`}
            size="small"
            sx={{
              bgcolor: BIM_COLORS.primary.soft,
              color: BIM_COLORS.primary.main,
              fontWeight: 'bold',
              border: 'none',
              fontSize: '0.7rem'
            }}
          />
          {(filterTipo || filterEstado) && (
            <Chip
              label={`Filtrados: ${rdiList.length}`}
              size="small"
              sx={{
                bgcolor: BIM_COLORS.accent.soft,
                color: BIM_COLORS.accent.main,
                fontWeight: 'bold',
                border: 'none',
                fontSize: '0.7rem'
              }}
            />
          )}
        </Box>
      </Box>

      {/* Sección scrolleable - Lista de RDIs */}
      <Box sx={{
        flex: 1,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <List sx={{
          flex: 1,
          overflow: 'auto',
          p: 0,
          '& .MuiListItem-root': {
            borderRadius: 1,
            mb: 1.5,
            border: `1px solid ${BIM_COLORS.neutral.border}`,
            bgcolor: 'white',
            transition: 'all 0.2s',
            '&:hover': {
              borderColor: BIM_COLORS.primary.main,
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              transform: 'translateY(-2px)'
            },
          }
        }}>
          {rdiList.map((rdi) => (
            <ListItem
              key={rdi.id}
              secondaryAction={
                <Box sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 0.5,
                  alignItems: 'center',
                  ml: 1
                }}>
                  <IconButton
                    onClick={() => onExportToBCF(rdi.id)}
                    size="small"
                    title="Exportar BCF"
                    sx={{ color: BIM_COLORS.accent.main }}
                  >
                    <FileDownloadIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    onClick={() => onEdit(rdi)}
                    size="small"
                    title="Ver Detalles"
                    sx={{ color: BIM_COLORS.primary.main }}
                  >
                    <PreviewIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    onClick={() => onDelete(rdi.id)}
                    size="small"
                    title="Eliminar"
                    sx={{ color: BIM_COLORS.status.error.main }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              }
            >
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column', gap: 0.5, mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: BIM_COLORS.neutral.text.primary, lineHeight: 1.2 }}>
                      {rdi.titulo}
                    </Typography>
                    <Chip
                      label={rdi.tipo || rdi.types || "Sin tipo"}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.65rem',
                        bgcolor: BIM_COLORS.primary.main,
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
                  </Box>
                }
                secondary={
                  <Box component="span" sx={{ display: 'block' }}>
                    <Typography variant="caption" sx={{ color: BIM_COLORS.neutral.text.secondary, display: 'block' }}>
                      <strong>Estado:</strong> <span style={{
                        color: (rdi.estado || rdi.statuses) === 'Resuelto' ? BIM_COLORS.accent.main : BIM_COLORS.status.warning.main,
                        fontWeight: 'bold'
                      }}>
                        {rdi.estado || rdi.statuses || "No definido"}
                      </span>
                    </Typography>
                    <Typography variant="caption" sx={{ color: BIM_COLORS.neutral.text.secondary, display: 'block' }}>
                      <strong>Asignado:</strong> {rdi.assignedTo || "No asignado"}
                    </Typography>
                    <Typography variant="caption" sx={{ color: BIM_COLORS.neutral.text.secondary, display: 'block' }}>
                      <strong>Fecha:</strong> {(() => {
                        if (!rdi.fecha) return 'No definida';
                        const date = new Date(rdi.fecha);
                        return isNaN(date.getTime()) ? rdi.fecha : date.toLocaleDateString('es-ES');
                      })()}
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
        flexShrink: 0,
        mt: 1,
        p: 1.5,
        backgroundColor: BIM_COLORS.neutral.background.secondary,
        borderRadius: 1,
        border: `1px solid ${BIM_COLORS.neutral.border}`
      }}>
        <Typography variant="caption" sx={{ color: BIM_COLORS.neutral.text.secondary, fontWeight: 'medium' }}>
          Resumen: {Array.from(bcfTopicSet.statuses || []).map(estado => {
            const count = rdiList.filter(rdi => (rdi.estado || rdi.statuses) === estado).length;
            return count > 0 ? `${estado}: ${count}` : null;
          }).filter(Boolean).join(' | ') || 'Sin datos'}
        </Typography>
      </Box>
    </Box>
  );
};

export default RDIList;