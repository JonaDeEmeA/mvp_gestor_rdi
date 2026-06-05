import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Chip,
  InputAdornment,
  Avatar,
  Tooltip,
  Grid,
  Menu,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme,
  Drawer,
  Collapse,
  Backdrop,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  FiberManualRecord as DotIcon,
  ArrowUpward as HighPriorityIcon,
  ArrowForward as MediumPriorityIcon,
  ArrowDownward as LowPriorityIcon,
  VisibilityOutlined as VisibilityIcon,
  EditOutlined as EditIcon,
  Adjust as AdjustIcon,
  ChevronRight as ChevronRightIcon,
  DeleteOutline as DeleteIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import { getIssuesByProject, updateIssue, deleteIssue } from '../../utilitario/indexedDBManager';
import RDIView from '../TabTools/RDIView';
import RDIForm from '../TabTools/RDIForm';
import { useAuth } from '../../hooks/useAuth';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { RDI_STANDARDS } from '../../constants/rdiStandards';

const PALETTE = {
  primary: '#1F3A5F',
  accent: '#4CAF50',
  border: '#E8ECF0',
  textSecondary: '#5F6B7A',
};

const IncidenciasPanel = ({ projectId, onCreateClick }) => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // Solo en móviles (xs)
  const router = useRouter();

  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Estados para filtros
  const [showFilters, setShowFilters] = useState(false);
  const [filterEstado, setFilterEstado] = useState('Todos');
  const [filterTipo, setFilterTipo] = useState('Todos');
  const [filterPrioridad, setFilterPrioridad] = useState('Todos');
  const [filterAsignado, setFilterAsignado] = useState('Todos');
  const [filterNivel, setFilterNivel] = useState('Todos');

  // Estados para el menú de acciones
  const [anchorEl, setAnchorEl] = useState(null);
  const [statusAnchorEl, setStatusAnchorEl] = useState(null);
  const [selectedIssueId, setSelectedIssueId] = useState(null);
  const [viewedIssueId, setViewedIssueId] = useState(null);
  const [drawerMode, setDrawerMode] = useState('view'); // 'view' o 'edit'
  const [localFormData, setLocalFormData] = useState(null);
  const [navigatingToViewer, setNavigatingToViewer] = useState(false);

  const handleEnterEditMode = () => {
    const issue = issues.find(i => i.id === viewedIssueId);
    if (issue) {
      setLocalFormData({
        ...issue,
        title: issue.title || '',
        description: issue.description || '',
        type: issue.type || 'General',
        status: issue.status || 'Abierta',
        label: issue.label || 'General',
        assignedTo: issue.assignedTo || '',
        dueDate: issue.dueDate ? new Date(issue.dueDate) : new Date(),
      });
      setDrawerMode('edit');
    }
  };

  const handleLocalFormChange = (field, value) => {
    setLocalFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveEdit = async () => {
    try {
      const updatedIssueData = {
        ...localFormData,
        updatedAt: new Date().toISOString()
      };

      // Intentar actualizar en ProjectsIssuesDB
      try {
        await updateIssue(viewedIssueId, updatedIssueData);
      } catch (err) {
        // Si no está en la DB local, está en la BCFDatabase
        await updateIssueInBCFDatabase(viewedIssueId, updatedIssueData);
      }

      // Actualizar UI local
      setIssues(prev => prev.map(issue => 
        issue.id === viewedIssueId ? { ...issue, ...updatedIssueData } : issue
      ));
      
      setDrawerMode('view');
    } catch (error) {
      console.error('Error al guardar cambios:', error);
    }
  };

  const handleAddComment = async (commentText) => {
    if (!viewedIssueId) return;
    try {
      const issue = issues.find(i => i.id === viewedIssueId);
      if (!issue) return;

      const newComment = {
        guid: `c-${Date.now()}`,
        date: new Date().toISOString(),
        author: user?.email || 'signed.user@mail.com', 
        comment: commentText
      };

      const updatedComments = [newComment, ...(issue.comments || [])];
      const updates = { comments: updatedComments };

      // Actualizar en DB
      try {
        await updateIssue(viewedIssueId, updates);
      } catch (err) {
        await updateIssueInBCFDatabase(viewedIssueId, updates);
      }

      // Actualizar UI local
      setIssues(prev => prev.map(i => i.id === viewedIssueId ? { ...i, comments: updatedComments } : i));
      
      // Si estamos en modo edición, también actualizar localFormData
      if (drawerMode === 'edit') {
        setLocalFormData(prev => ({ ...prev, comments: updatedComments }));
      }
    } catch (error) {
      console.error('Error al añadir comentario:', error);
    }
  };

  const handleOpenMenu = (event, id) => {
    setAnchorEl(event.currentTarget);
    setSelectedIssueId(id);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setStatusAnchorEl(null);
    setSelectedIssueId(null);
  };

  const handleOpenStatusMenu = (event) => {
    setStatusAnchorEl(event.currentTarget);
  };

  const handleCloseStatusMenu = () => {
    setStatusAnchorEl(null);
    setAnchorEl(null);
    setSelectedIssueId(null);
  };

  const handleOpenView = () => {
    setViewedIssueId(selectedIssueId);
    setAnchorEl(null);
    setStatusAnchorEl(null);
  };

  const handleStatusChange = async (newStatus) => {
    if (!selectedIssueId) return;

    const updates = { 
      status: newStatus,
      estado: newStatus // Sincronización para compatibilidad con visor 3D
    };

    try {
      try {
        await updateIssue(selectedIssueId, updates);
      } catch (err) {
        if (err.message === 'Issue no encontrado') {
          try {
            // A veces el ID puede ser un string pero en IndexedDB es un Number
            if (!isNaN(selectedIssueId)) {
              await updateIssue(Number(selectedIssueId), updates);
            } else {
              throw err;
            }
          } catch (innerErr) {
            // Si todo falla en ProjectsIssuesDB, intentamos en la base de datos de respaldo
            await updateIssueInBCFDatabase(selectedIssueId, updates);
          }
        } else {
          throw err;
        }
      }

      // Actualizar el estado local para reflejar el cambio de inmediato en la UI
      setIssues(prevIssues => prevIssues.map(issue =>
        issue.id === selectedIssueId ? { ...issue, ...updates } : issue
      ));
    } catch (error) {
      console.error('Error al actualizar el estado de la incidencia:', error);
    } finally {
      handleCloseStatusMenu();
    }
  };

  const handleDeleteIssue = async () => {
    if (!selectedIssueId) return;

    if (window.confirm('¿Estás seguro de que quieres eliminar esta incidencia?')) {
      try {
        // 1. Intentar eliminar de ProjectsIssuesDB (Base de datos del dashboard)
        let deleted = false;
        try {
          // Intentar con el ID tal cual (puede ser string o number)
          await deleteIssue(selectedIssueId);
          deleted = true;
        } catch (err) {
          // Si falla, probar convirtiendo a número si es posible
          if (!isNaN(selectedIssueId)) {
            try {
              await deleteIssue(Number(selectedIssueId));
              deleted = true;
            } catch (innerErr) {
              // No estaba en ProjectsIssuesDB como número tampoco
            }
          }
        }

        // 2. Intentar eliminar de BCFDatabase (Base de datos del visor 3D / Topics)
        try {
          await deleteIssueFromBCFDatabase(selectedIssueId);
          deleted = true;
        } catch (err) {
          // Si es un GUID de BCF, el deleteIssue(selectedIssueId) previo podría haber fallado o no existir en esa DB
          console.warn('No se encontró en BCFDatabase o error al borrar:', err.message);
        }

        if (deleted) {
          // Actualizar UI local
          setIssues(prev => prev.filter(issue => issue.id !== selectedIssueId));
          console.log('Incidencia eliminada exitosamente');
        } else {
          throw new Error('No se pudo encontrar la incidencia en ninguna base de datos');
        }

      } catch (error) {
        console.error('Error al eliminar la incidencia:', error);
        alert('Error al eliminar la incidencia: ' + error.message);
      } finally {
        handleCloseMenu();
      }
    }
  };

  useEffect(() => {
    loadIssues();
  }, [projectId]);

  const loadIssues = async () => {
    setLoading(true);
    try {
      // 1. Obtener de la base de datos principal (Proyectos/Issues)
      let dataDB1 = await getIssuesByProject(projectId);
      if (!dataDB1 || dataDB1.length === 0) dataDB1 = await getIssuesByProject(String(projectId));
      if (!dataDB1 || dataDB1.length === 0) dataDB1 = await getIssuesByProject(Number(projectId));
      dataDB1 = dataDB1 || [];

      // 2. Obtener de BCFDatabase/topics (Visor 3D)
      let dataDB2 = [];
      try {
        dataDB2 = await readFromBCFDatabase();
        // Filtrar por proyecto si es posible, aunque BCFDatabase no siempre tiene projectId
      } catch (e) {
        console.warn('No se pudo leer de BCFDatabase:', e);
      }

      // Combinar ambos conjuntos de datos
      const data = [...dataDB1, ...dataDB2];

      // Mapear campos para normalizarlos
      const normalizedData = data.map(item => {
        // Buscar la imagen en todas las variantes posibles
        let rawImage = null;

        if (item.snapshot && item.snapshot.imageData) {
          rawImage = item.snapshot.imageData;
        } else {
          rawImage = item.image || item.snapshot || item.ImageData || item.imageData || item.Snapshot ||
            (item.viewpoints && item.viewpoints[0]?.snapshot) ||
            (item.viewpoints && item.viewpoints[0]?.ImageData);
        }

        // Si es un string y no tiene el prefijo de data URI, lo añadimos (asumiendo PNG)
        if (typeof rawImage === 'string' && rawImage.length > 100 && !rawImage.startsWith('data:')) {
          rawImage = `data:image/png;base64,${rawImage}`;
        }

        // Si ImageData es un objeto (no Blob), intentar extraer .data o .blob
        if (rawImage && typeof rawImage === 'object' && !Array.isArray(rawImage) && !(rawImage instanceof Blob)) {
          rawImage = rawImage.data || rawImage.blob || rawImage.src || rawImage;
        }

        // Si es un Blob o File, convertir a URL
        if (rawImage instanceof Blob || rawImage instanceof File) {
          rawImage = URL.createObjectURL(rawImage);
        }

        const normalizedStatus = item.status || item.estado || 'Abierta';
        const normalizedType = item.type || item.tipo || 'General';
        const normalizedLabel = item.label || item.etiqueta || 'General';

        return {
          ...item,
          id: item.id || item.guid || 'N/A',
          title: item.title || item.titulo || 'Sin título',
          description: item.description || item.comentario || item.descripcion || '',
          // Validar contra estándares para evitar advertencias de MUI
          status: RDI_STANDARDS.statuses.includes(normalizedStatus) ? normalizedStatus : 'Abierta',
          type: RDI_STANDARDS.types.includes(normalizedType) ? normalizedType : 'General',
          label: RDI_STANDARDS.labels.includes(normalizedLabel) ? normalizedLabel : 'General',
          priority: item.priority || item.prioridad || 'Media',
          assignedTo: item.assignedTo || item.asignado_a || '',
          createdAt: item.createdAt || item.creationDate || new Date().toISOString(),
          image: rawImage,
        };
      });

      setIssues(normalizedData);
    } catch (error) {
      console.error('Error cargando incidencias:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteIssueFromBCFDatabase = (issueId) => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('BCFDatabase', 2);
      request.onsuccess = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('topics')) {
          resolve(false); // No existe el store, nada que borrar
          return;
        }
        const tx = db.transaction(['topics'], 'readwrite');
        const store = tx.objectStore('topics');
        
        // El ID en BCFDatabase suele ser un GUID (string)
        const deleteReq = store.delete(issueId);
        
        deleteReq.onsuccess = () => resolve(true);
        deleteReq.onerror = () => reject(deleteReq.error);
      };
      request.onerror = () => reject(request.error);
    });
  };

  const readFromBCFDatabase = () => {
    return new Promise((resolve) => {
      const request = indexedDB.open('BCFDatabase', 2);
      request.onsuccess = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('topics')) {
          resolve([]);
          return;
        }
        const tx = db.transaction(['topics'], 'readonly');
        const store = tx.objectStore('topics');
        const getAll = store.getAll();
        getAll.onsuccess = () => resolve(getAll.result || []);
        getAll.onerror = () => resolve([]);
      };
      request.onerror = () => resolve([]);
    });
  };

  const updateIssueInBCFDatabase = (issueId, updates) => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('BCFDatabase', 2);
      request.onsuccess = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('topics')) {
          reject(new Error('Store topics no encontrado en BCFDatabase'));
          return;
        }
        const tx = db.transaction(['topics'], 'readwrite');
        const store = tx.objectStore('topics');
        const getRequest = store.get(issueId);

        getRequest.onsuccess = () => {
          const topic = getRequest.result;
          if (!topic) {
            reject(new Error('Issue no encontrado en BCFDatabase'));
            return;
          }

          // Mapeo bidireccional (Canonical -> Legacy para BCFDatabase)
          const updatedTopic = {
            ...topic,
            ...updates,
            // Sincronizar llaves legadas por si el visor las usa todavía
            titulo: updates.title || topic.titulo || topic.title,
            estado: updates.status || topic.estado || topic.status,
            tipo: updates.type || topic.tipo || topic.type,
            etiqueta: updates.label || topic.etiqueta || topic.label,
            comentario: updates.description || topic.comentario || topic.description
          };

          const updateReq = store.put(updatedTopic);
          updateReq.onsuccess = () => resolve(true);
          updateReq.onerror = () => reject(updateReq.error);
        };
        getRequest.onerror = () => reject(getRequest.error);
      };
      request.onerror = () => reject(request.error);
    });
  };

  // Lógica de filtrado
  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.id?.toString().includes(searchTerm);
    const matchesEstado = filterEstado === 'Todos' || issue.status === filterEstado;
    const matchesTipo = filterTipo === 'Todos' || issue.type === filterTipo;
    const matchesAsignado = filterAsignado === 'Todos' || issue.assignedTo === filterAsignado;

    return matchesSearch && matchesEstado && matchesTipo && matchesAsignado;
  });

  // Obtener opciones únicas para los filtros dinámicamente
  const uniqueStatuses = Array.from(new Set(issues.map(i => i.status).filter(Boolean)));
  const uniqueTypes = Array.from(new Set(issues.map(i => i.type).filter(Boolean)));
  const uniqueAssignees = Array.from(new Set(issues.map(i => i.assignedTo).filter(Boolean)));

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Resuelta':
      case 'Resuelto':
      case 'Abierta': return { bgcolor: '#E8F5E9', color: '#4CAF50' };
      case 'Pendiente':
      case 'En progreso':
      case 'En revision': return { bgcolor: '#FFF8E1', color: '#FBC02D' };
      case 'Cerrada':
      case 'Cerrado': return { bgcolor: '#F5F5F5', color: '#9E9E9E' };
      default: return { bgcolor: '#F5F5F5', color: '#9E9E9E' };
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'Alta': return <HighPriorityIcon sx={{ color: '#EF5350', fontSize: '1rem' }} />;
      case 'Media': return <MediumPriorityIcon sx={{ color: '#FFA726', fontSize: '1rem' }} />;
      case 'Baja': return <LowPriorityIcon sx={{ color: '#66BB6A', fontSize: '1rem' }} />;
      default: return null;
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Cabecera del Panel */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' }, 
        justifyContent: 'space-between', 
        alignItems: { xs: 'stretch', sm: 'flex-start' },
        gap: 2 
      }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1E1E1E' }}>
            Incidencias
          </Typography>
          <Typography variant="body2" sx={{ color: PALETTE.textSecondary }}>
            Consulta y gestiona todas las incidencias del proyecto.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onCreateClick}
          sx={{
            bgcolor: PALETTE.primary,
            textTransform: 'none',
            fontWeight: 'bold',
            px: 3,
            py: 1,
            width: { xs: '100%', sm: 'auto' },
            alignSelf: { xs: 'stretch', sm: 'flex-start' },
            '&:hover': { bgcolor: '#2B5DAF' }
          }}
        >
          Crear incidencia
        </Button>
      </Box>

      {/* Barra de Filtros */}
      <Paper elevation={0} sx={{ p: 2, border: `1px solid ${PALETTE.border}`, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          {isMobile ? (
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Buscar incidencia..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: '#9AA4AF', fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Button
                    variant={showFilters ? "contained" : "outlined"}
                    startIcon={<FilterIcon />}
                    onClick={() => setShowFilters(!showFilters)}
                    sx={{ 
                      color: showFilters ? 'white' : '#1E1E1E', 
                      bgcolor: showFilters ? PALETTE.primary : 'transparent',
                      borderColor: showFilters ? PALETTE.primary : PALETTE.border, 
                      textTransform: 'none',
                      fontWeight: 'bold',
                      whiteSpace: 'nowrap',
                      '&:hover': {
                        bgcolor: showFilters ? '#2B5DAF' : 'rgba(0,0,0,0.04)',
                        borderColor: showFilters ? '#2B5DAF' : PALETTE.border
                      }
                    }}
                  >
                    Filtros
                  </Button>
                </Box>
                <Collapse in={showFilters}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Estado</InputLabel>
                      <Select value={filterEstado} label="Estado" onChange={(e) => setFilterEstado(e.target.value)}>
                        <MenuItem value="Todos">Todos</MenuItem>
                        {uniqueStatuses.map(status => (
                          <MenuItem key={status} value={status}>{status}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl fullWidth size="small">
                      <InputLabel>Tipo</InputLabel>
                      <Select value={filterTipo} label="Tipo" onChange={(e) => setFilterTipo(e.target.value)}>
                        <MenuItem value="Todos">Todos</MenuItem>
                        {uniqueTypes.map(type => (
                          <MenuItem key={type} value={type}>{type}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl fullWidth size="small">
                      <InputLabel>Asignado a</InputLabel>
                      <Select value={filterAsignado} label="Asignado a" onChange={(e) => setFilterAsignado(e.target.value)}>
                        <MenuItem value="Todos">Todos</MenuItem>
                        {uniqueAssignees.map(user => (
                          <MenuItem key={user} value={user}>{user}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Collapse>
              </Box>
            </Grid>
          ) : (
            <>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Estado</InputLabel>
                  <Select value={filterEstado} label="Estado" onChange={(e) => setFilterEstado(e.target.value)}>
                    <MenuItem value="Todos">Todos</MenuItem>
                    {uniqueStatuses.map(status => (
                      <MenuItem key={status} value={status}>{status}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Tipo</InputLabel>
                  <Select value={filterTipo} label="Tipo" onChange={(e) => setFilterTipo(e.target.value)}>
                    <MenuItem value="Todos">Todos</MenuItem>
                    {uniqueTypes.map(type => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Asignado a</InputLabel>
                  <Select value={filterAsignado} label="Asignado a" onChange={(e) => setFilterAsignado(e.target.value)}>
                    <MenuItem value="Todos">Todos</MenuItem>
                    {uniqueAssignees.map(user => (
                      <MenuItem key={user} value={user}>{user}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6} sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Buscar incidencia..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: '#9AA4AF', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </>
          )}
        </Grid>
      </Paper>

      {/* Tabla o Lista de Incidencias */}
      {isMobile ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filteredIssues.length > 0 ? (
            filteredIssues.map((issue) => (
              <Paper key={issue.id} elevation={0} sx={{ p: 2, borderRadius: 2, border: `1px solid ${PALETTE.border}` }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Box sx={{ flexShrink: 0 }}>
                    <Avatar
                      variant="rounded"
                      src={issue.image}
                      sx={{
                        width: 70,
                        height: 70,
                        bgcolor: '#F1F3F4',
                        border: `1px solid ${PALETTE.border}`
                      }}
                    >
                      <SearchIcon sx={{ color: '#9AA4AF' }} />
                    </Avatar>
                  </Box>

                  <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#1E1E1E', lineHeight: 1.2 }}>
                        {issue.title}
                      </Typography>
                      <IconButton size="small" onClick={(e) => handleOpenMenu(e, issue.id)} sx={{ mt: -1, mr: -1 }}>
                        <MoreVertIcon />
                      </IconButton>
                    </Box>

                    <Box sx={{ mb: 0.5 }}>
                      <Chip
                        label={issue.type}
                        size="small"
                        sx={{
                          bgcolor: PALETTE.primary,
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '0.65rem',
                          height: 20,
                          borderRadius: 2
                        }}
                      />
                    </Box>

                    <Typography variant="body2" sx={{ color: PALETTE.textSecondary, fontSize: '0.85rem' }}>
                      Estado: <Box component="span" sx={{ color: getStatusStyle(issue.status).color, fontWeight: 'bold' }}>{issue.status}</Box>
                    </Typography>

                    <Typography variant="body2" sx={{ color: PALETTE.textSecondary, fontSize: '0.85rem' }}>
                      Asignado: <Box component="span" sx={{ color: '#1E1E1E' }}>{issue.assignedTo || 'Sin asignar'}</Box>
                    </Typography>

                    <Typography variant="body2" sx={{ color: PALETTE.textSecondary, fontSize: '0.85rem' }}>
                      F. Creación: <Box component="span" sx={{ color: '#1E1E1E' }}>{new Date(issue.createdAt).toLocaleDateString()}</Box>
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            ))
          ) : (
            <Paper elevation={0} sx={{ p: 4, textAlign: 'center', border: `1px solid ${PALETTE.border}`, borderRadius: 2 }}>
              <Typography variant="body1" sx={{ color: PALETTE.textSecondary }}>
                {loading ? 'Cargando incidencias...' : 'No se encontraron incidencias.'}
              </Typography>
            </Paper>
          )}
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${PALETTE.border}`, borderRadius: 2 }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', color: PALETTE.textSecondary, display: { xs: 'none', md: 'table-cell' } }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: PALETTE.textSecondary }}>Título</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: PALETTE.textSecondary, display: { xs: 'none', sm: 'table-cell' } }}>Tipo</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: PALETTE.textSecondary }}>Estado</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: PALETTE.textSecondary, display: { xs: 'none', md: 'table-cell' } }}>Asignado a</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: PALETTE.textSecondary, display: { xs: 'none', lg: 'table-cell' } }}>Fecha</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: PALETTE.textSecondary }} align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredIssues.length > 0 ? (
                filteredIssues.map((issue) => (
                  <TableRow key={issue.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell sx={{ color: '#1976D2', fontWeight: 'bold', display: { xs: 'none', md: 'table-cell' } }}>
                      INC-{issue.id.toString().padStart(5, '0')}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Avatar
                          variant="rounded"
                          src={issue.image}
                          sx={{
                            width: 50,
                            height: 50,
                            bgcolor: '#F1F3F4',
                            border: `1px solid ${PALETTE.border}`
                          }}
                        >
                          <SearchIcon sx={{ color: '#9AA4AF' }} />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#1E1E1E' }}>{issue.title}</Typography>
                          <Typography variant="caption" sx={{ color: PALETTE.textSecondary, display: 'block', maxWidth: 250, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {issue.description || 'Sin descripción'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <DotIcon sx={{ color: issue.type === 'Calidad' ? '#42A5F5' : '#7E57C2', fontSize: 12 }} />
                        <Typography variant="body2">{issue.type}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={issue.status}
                        size="small"
                        sx={{
                          ...getStatusStyle(issue.status),
                          fontWeight: 'bold',
                          fontSize: '0.75rem',
                          borderRadius: '4px'
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 24, height: 24, fontSize: '0.7rem', bgcolor: PALETTE.primary }}>
                          {issue.assignedTo?.[0] || 'U'}
                        </Avatar>
                        <Typography variant="body2">{issue.assignedTo || 'Unassigned'}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>
                      <Typography variant="body2">{new Date(issue.createdAt).toLocaleDateString()}</Typography>
                      <Typography variant="caption" sx={{ color: PALETTE.textSecondary }}>{new Date(issue.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton size="small" onClick={(e) => handleOpenMenu(e, issue.id)}>
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
                    <Typography variant="body1" sx={{ color: PALETTE.textSecondary }}>
                      {loading ? 'Cargando incidencias...' : 'No se encontraron incidencias.'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Menú principal de acciones */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        PaperProps={{
          elevation: 3,
          sx: { borderRadius: 2, minWidth: 200, mt: 0.5, border: '1px solid #E8ECF0' }
        }}
      >
        <MenuItem onClick={handleOpenView}>
          <ListItemIcon><VisibilityIcon fontSize="small" sx={{ color: '#5F6B7A' }} /></ListItemIcon>
          <ListItemText primaryTypographyProps={{ variant: 'body2', color: '#1E1E1E' }}>Ver detalle</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleOpenStatusMenu} sx={{ bgcolor: statusAnchorEl ? '#F5F7FA' : 'transparent' }}>
          <ListItemIcon><AdjustIcon fontSize="small" sx={{ color: '#5F6B7A' }} /></ListItemIcon>
          <ListItemText primaryTypographyProps={{ variant: 'body2', color: '#1E1E1E' }}>Cambiar estado</ListItemText>
          <ChevronRightIcon fontSize="small" sx={{ color: '#9AA4AF' }} />
        </MenuItem>

        <Divider sx={{ my: 1 }} />

        <MenuItem onClick={handleDeleteIssue}>
          <ListItemIcon><DeleteIcon fontSize="small" sx={{ color: '#EF5350' }} /></ListItemIcon>
          <ListItemText primaryTypographyProps={{ variant: 'body2', color: '#EF5350', fontWeight: 'bold' }}>Eliminar</ListItemText>
        </MenuItem>
      </Menu>

      {/* Submenú de estados */}
      <Menu
        anchorEl={statusAnchorEl}
        open={Boolean(statusAnchorEl)}
        onClose={() => setStatusAnchorEl(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        PaperProps={{
          elevation: 3,
          sx: { borderRadius: 2, minWidth: 160, ml: 1, border: '1px solid #E8ECF0' }
        }}
      >
        <MenuItem onClick={() => handleStatusChange('Abierta')}>
          <ListItemIcon><DotIcon sx={{ fontSize: 14, color: '#4CAF50' }} /></ListItemIcon>
          <ListItemText primaryTypographyProps={{ variant: 'body2', color: '#1E1E1E' }}>Abierta</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleStatusChange('En revisión')}>
          <ListItemIcon><DotIcon sx={{ fontSize: 14, color: '#FFB300' }} /></ListItemIcon>
          <ListItemText primaryTypographyProps={{ variant: 'body2', color: '#1E1E1E' }}>En revisión</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleStatusChange('En proceso')}>
          <ListItemIcon><DotIcon sx={{ fontSize: 14, color: '#1976D2' }} /></ListItemIcon>
          <ListItemText primaryTypographyProps={{ variant: 'body2', color: '#1E1E1E' }}>En proceso</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleStatusChange('Resuelta')}>
          <ListItemIcon><DotIcon sx={{ fontSize: 14, color: '#4CAF50' }} /></ListItemIcon>
          <ListItemText primaryTypographyProps={{ variant: 'body2', color: '#1E1E1E' }}>Resuelta</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleStatusChange('Cerrada')}>
          <ListItemIcon><DotIcon sx={{ fontSize: 14, color: '#9E9E9E' }} /></ListItemIcon>
          <ListItemText primaryTypographyProps={{ variant: 'body2', color: '#1E1E1E' }}>Cerrada</ListItemText>
        </MenuItem>
      </Menu>

      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
        <Drawer
          anchor="right"
          open={Boolean(viewedIssueId)}
          onClose={() => {
            setViewedIssueId(null);
            setDrawerMode('view');
          }}
          PaperProps={{ sx: { width: { xs: '100%', sm: 450 }, p: 0, bgcolor: '#F8FAFC' } }}
        >
          {viewedIssueId && (
            <Box sx={{ position: 'relative', height: '100%' }}>
              {drawerMode === 'view' ? (
                <RDIView 
                  rdi={issues.find(i => i.id === viewedIssueId)}
                  onClose={() => setViewedIssueId(null)}
                  onEdit={handleEnterEditMode}
                  onAddComment={handleAddComment}
                  onVerSnapshot={() => {
                     const id = viewedIssueId;
                     setViewedIssueId(null);
                     setNavigatingToViewer(true);
                     router.push(`/viewer?tool=rdi&viewId=${id}`);
                  }}
                />
              ) : (
                <Box sx={{ p: 2 }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: PALETTE.primary }}>
                    Editar Incidencia
                  </Typography>
                  <RDIForm 
                    showForm={true}
                    formData={localFormData}
                    onFormChange={handleLocalFormChange}
                    onAccept={handleSaveEdit}
                    onCancel={() => setDrawerMode('view')}
                    onAddComment={handleAddComment}
                    onVerSnapshotPV={() => {
                      const id = viewedIssueId;
                      const hasSnapshot = !!(localFormData?.snapshot?.imageData);
                      setViewedIssueId(null);
                      setNavigatingToViewer(true);
                      router.push(`/viewer?tool=rdi&${hasSnapshot ? 'viewId' : 'editId'}=${id}`);
                    }}
                    isEditing={true}
                    snapshotUrl={localFormData?.snapshot?.imageData ? 
                      (localFormData.snapshot.imageData.startsWith('data:') ? localFormData.snapshot.imageData : `data:image/png;base64,${localFormData.snapshot.imageData}`) : null}
                  />
                </Box>
              )}
            </Box>
          )}
        </Drawer>
      </LocalizationProvider>

      <Backdrop
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(6px)'
        }}
        open={navigatingToViewer}
      >
        <CircularProgress size={50} sx={{ color: '#38bdf8' }} />
        <Typography variant="h6" sx={{ color: '#f8fafc', fontWeight: '500' }}>
          Abriendo visor 3D...
        </Typography>
        <Typography variant="body2" sx={{ color: '#94a3b8' }}>
          Preparando el entorno de visualización.
        </Typography>
      </Backdrop>
    </Box>
  );
};

export default IncidenciasPanel;
