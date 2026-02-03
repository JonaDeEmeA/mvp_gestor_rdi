// src/components/Dashboard/MainDashboard.jsx
// Dashboard principal con useAuth importado directamente

import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/router';

import { createProject, updateProject, deleteProject } from '../../utilitario/indexedDBManager';
import CreateProjectDialog from './CreateProjectDialog';
import EditProjectDialog from './EditProjectDialog';

import { 
  IconButton, 
  Tooltip, 
  Button, 
  Box, 
  CircularProgress,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Avatar,
  Divider,
  useTheme,
  useMediaQuery,
  Paper
} from '@mui/material';
import { Edit, Menu as MenuIcon, Add as AddIcon, Logout as LogoutIcon, Dashboard as DashboardIcon, Folder as FolderIcon } from '@mui/icons-material';

const DRAWER_WIDTH = 280;

export default function Dashboard({ userProjects = [] }) {
  // ✅ PASO 0.1: Usar el hook de autenticación directamente
  const authHook = useAuth();
  const router = useRouter();

  const [projects, setProjects] = useState(userProjects);
  const [currentProject, setCurrentProject] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  // 🔍 DIAGNÓSTICO: Verificar que authHook esté disponible
  console.log('═══════════════════════════════════════════');
  console.log('🔍 PASO 0.1: Verificando useAuth hook');
  console.log('═══════════════════════════════════════════');
  console.log('  - useAuth disponible:', !!authHook);
  console.log('  - Usuario:', authHook?.user?.email || 'No autenticado');
  console.log('  - Funciones:', {
    login: typeof authHook?.login === 'function',
    logout: typeof authHook?.logout === 'function',
    register: typeof authHook?.register === 'function'
  });
  console.log('═══════════════════════════════════════════');

  const user = authHook?.user || {
    email: 'user@example.com',
    displayName: 'Usuario Demo'
  };

  // Detectar si es mobile usando MUI
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  // Mantener drawerOpen en true por defecto en desktop, false en mobile

  // ✅ TEST PASO 1.1: Cargar proyectos al montar
  useEffect(() => {
    console.log('🔄 PASO 1.1: Cargando proyectos del usuario:', user.email);
    loadProjects();
  }, [user.email]);

  const loadProjects = async () => {
    console.log('📂 Cargando proyectos desde IndexedDB...');
    setLoading(true);

    try {
      // TODO: Implementar con IndexedDB real
      const mockProjects = userProjects.length > 0 ? userProjects : [];

      console.log('✅ PASO 1.1 COMPLETADO: Proyectos cargados:', mockProjects.length);
      setProjects(mockProjects);

      if (mockProjects.length > 0) {
        setCurrentProject(mockProjects[0]);
      }
    } catch (error) {
      console.error('❌ Error cargando proyectos:', error);
    } finally {
      setLoading(false);
    }
  };



  // ✅ TEST PASO 1.3: Seleccionar proyecto
  const handleSelectProject = (project) => {
    console.log('📌 PASO 1.3: Proyecto seleccionado:', project.name);
    setCurrentProject(project);

    // 📱 Cerrar drawer automáticamente en mobile
    if (isMobile) {
      setDrawerOpen(false);
      console.log('📱 Drawer cerrado automáticamente (mobile)');
    }
  };

  // ✅ Crear nuevo proyecto
  const handleCreateProject = async (projectName) => {
    console.log('➕ Creando proyecto:', projectName);

    try {
      const projectData = {
        name: projectName,
        userEmail: user.email,
      };

      const savedProject = await createProject(projectData);
      console.log('✅ Proyecto guardado en IndexedDB:', savedProject);

      setProjects(prev => [...prev, savedProject]);
      setCurrentProject(savedProject);

    } catch (error) {
      console.error('❌ Error creando proyecto:', error);
      throw error;
    }
  };

  // ✅ Actualizar proyecto existente
  const handleUpdateProject = async (projectId, updates) => {
    console.log('✏️ Actualizando proyecto:', projectId);

    try {
      const updatedProject = await updateProject(projectId, updates);
      console.log('✅ Proyecto actualizado en IndexedDB:', updatedProject);

      setProjects(prev =>
        prev.map(p => p.id === projectId ? updatedProject : p)
      );

      if (currentProject?.id === projectId) {
        setCurrentProject(updatedProject);
      }

    } catch (error) {
      console.error('❌ Error actualizando proyecto:', error);
      throw error;
    }
  };

  // ✅ Eliminar proyecto
  const handleDeleteProject = async (projectId) => {
    console.log('🗑️ Eliminando proyecto:', projectId);

    try {
      await deleteProject(projectId);
      console.log('✅ Proyecto eliminado de IndexedDB');

      setProjects(prev => prev.filter(p => p.id !== projectId));

      if (currentProject?.id === projectId) {
        setCurrentProject(null);
      }

    } catch (error) {
      console.error('❌ Error eliminando proyecto:', error);
      throw error;
    }
  };

  // 🚪 PASO 1.4: Logout con Firebase
  const handleLogout = async () => {
    console.log('═══════════════════════════════════════════');
    console.log('🚪 PASO 1.4: Iniciando proceso de logout');
    console.log('═══════════════════════════════════════════');

    if (!authHook || !authHook.logout) {
      console.error('❌ ERROR: authHook.logout no está disponible');
      alert('Error: Función de logout no disponible');
      return;
    }

    console.log('🔍 DIAGNÓSTICO:');
    console.log('  - Usuario actual:', user.email);
    console.log('  - Tipo de logout:', typeof authHook.logout);

    setLogoutLoading(true);

    try {
      console.log('📡 PASO 1.4.1: Llamando a authHook.logout()...');
      const result = await authHook.logout();

      console.log('📥 PASO 1.4.2: Resultado de logout:', result);

      if (result.success) {
        console.log('✅ PASO 1.4 COMPLETADO: Logout exitoso');
        console.log('🔄 Redirigiendo a página de inicio...');
        router.push('/');
      } else {
        console.error('❌ Error en logout:', result.error);
        alert('Error al cerrar sesión: ' + (result.error || 'Error desconocido'));
      }
    } catch (error) {
      console.error('❌ EXCEPCIÓN en logout:', error);
      alert('Error inesperado al cerrar sesión: ' + error.message);
    } finally {
      setLogoutLoading(false);
    }

    console.log('═══════════════════════════════════════════');
  };

  // Contenido del Drawer (Sidebar)
  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#1F3A5F', color: 'white' }}>
      {/* Header del Drawer */}
      <Box sx={{ 
        p: 3, 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2,
        borderBottom: '1px solid rgba(255,255,255,0.1)' 
      }}>
        <DashboardIcon sx={{ color: '#4CAF50' }} />
        <Typography variant="h6" fontWeight="bold">
          Proyectos
        </Typography>
      </Box>

      {/* Lista de Proyectos */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress size={24} sx={{ color: 'white' }} />
          </Box>
        ) : projects.length === 0 ? (
          <Typography variant="body2" sx={{ textAlign: 'center', color: 'rgba(255,255,255,0.7)', mt: 2 }}>
            No tienes proyectos aún
          </Typography>
        ) : (
          <List disablePadding>
            {projects.map(project => (
              <ListItem 
                key={project.id} 
                disablePadding 
                sx={{ mb: 1 }}
                secondaryAction={
                  <Tooltip title="Editar proyecto">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingProject(project);
                        setShowEditDialog(true);
                      }}
                      sx={{ 
                        color: 'rgba(255,255,255,0.7)',
                        '&:hover': { color: 'white', bgcolor: 'rgba(255,255,255,0.1)' }
                      }}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                  </Tooltip>
                }
              >
                <ListItemButton
                  selected={currentProject?.id === project.id}
                  onClick={() => handleSelectProject(project)}
                  sx={{
                    borderRadius: '8px',
                    '&.Mui-selected': {
                      bgcolor: '#2B5DAF',
                      '&:hover': { bgcolor: '#1F4B8F' }
                    },
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.05)'
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <FolderIcon sx={{ 
                      color: currentProject?.id === project.id ? '#4CAF50' : 'rgba(255,255,255,0.5)',
                      fontSize: 20
                    }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={project.name}
                    secondary={new Date(project.createdAt).toLocaleDateString()}
                    primaryTypographyProps={{ 
                      fontWeight: currentProject?.id === project.id ? 'bold' : 'normal',
                      color: 'white',
                      noWrap: true
                    }}
                    secondaryTypographyProps={{ 
                      color: 'rgba(255,255,255,0.5)',
                      fontSize: '0.75rem'
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </Box>

      {/* Botón Crear Proyecto */}
      <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowCreateDialog(true)}
          sx={{
            bgcolor: '#4CAF50',
            color: 'white',
            fontWeight: 'bold',
            textTransform: 'none',
            py: 1.5,
            '&:hover': { bgcolor: '#43A047' }
          }}
        >
          Crear Proyecto
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#F5F7FA' }}>
      
      {/* AppBar Superior */}
      <AppBar 
        position="fixed" 
        sx={{
          width: { md: drawerOpen ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%' },
          ml: { md: drawerOpen ? `${DRAWER_WIDTH}px` : 0 },
          bgcolor: 'white',
          color: '#1E1E1E',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={() => setDrawerOpen(!drawerOpen)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ flexGrow: 1 }} />

          {/* Usuario y Logout */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ bgcolor: '#1F3A5F', width: 36, height: 36, fontSize: '1rem' }}>
                {user.displayName?.[0] || user.email[0].toUpperCase()}
              </Avatar>
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#1E1E1E' }}>
                  {user.displayName || 'Usuario'}
                </Typography>
                <Typography variant="caption" sx={{ color: '#5F6B7A' }}>
                  {user.email}
                </Typography>
              </Box>
            </Box>

            <Divider orientation="vertical" flexItem sx={{ height: 24, alignSelf: 'center' }} />

            <Button
              onClick={handleLogout}
              disabled={logoutLoading}
              variant="outlined"
              startIcon={logoutLoading ? <CircularProgress size={16} /> : <LogoutIcon />}
              sx={{
                color: '#D32F2F',
                borderColor: '#D32F2F',
                textTransform: 'none',
                fontWeight: 'bold',
                '&:hover': {
                  bgcolor: '#FDECEA',
                  borderColor: '#D32F2F'
                }
              }}
            >
              {logoutLoading ? 'Saliendo...' : 'Salir'}
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer (Sidebar) */}
      <Box
        component="nav"
        sx={{ width: { md: drawerOpen ? DRAWER_WIDTH : 0 }, flexShrink: { md: 0 }, transition: 'width 0.3s' }}
      >
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={drawerOpen && isMobile}
          onClose={() => setDrawerOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH, bgcolor: '#1F3A5F' },
          }}
        >
          {drawerContent}
        </Drawer>

        {/* Desktop Drawer */}
        <Drawer
          variant="persistent"
          open={drawerOpen && !isMobile}
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: DRAWER_WIDTH, 
              bgcolor: '#1F3A5F',
              borderRight: 'none'
            },
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Contenido Principal */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          mt: 8, 
          width: { md: drawerOpen ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%' },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          overflow: 'auto'
        }}
      >
          {!currentProject ? (
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '80vh',
              gap: 3
            }}>
              <FolderIcon sx={{ fontSize: 80, color: '#D9DEE5' }} />
              <Typography variant="h5" sx={{ color: '#5F6B7A', fontWeight: 'bold' }}>
                No hay proyecto seleccionado
              </Typography>
              <Typography variant="body1" sx={{ color: '#9AA4AF' }}>
                Selecciona un proyecto del menú lateral o crea uno nuevo
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setShowCreateDialog(true)}
                sx={{
                  bgcolor: '#1F3A5F',
                  color: 'white',
                  fontWeight: 'bold',
                  textTransform: 'none',
                  px: 4,
                  py: 1.5,
                  '&:hover': { bgcolor: '#2B5DAF' }
                }}
              >
                Crear Primer Proyecto
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
              <Typography variant="h4" sx={{ mb: 3, color: '#1E1E1E', fontWeight: 'bold' }}>
                Proyecto: {currentProject.name}
              </Typography>
              
              <Paper sx={{ p: 4, borderRadius: 2, flex: 1, bgcolor: 'white' }}>
                <Typography variant="body1" sx={{ color: '#5F6B7A' }}>
                  Aquí se mostrarán los issues del proyecto.
                </Typography>
                <Typography variant="caption" sx={{ color: '#9AA4AF', mt: 1, display: 'block' }}>
                  (Próximo paso: Implementar gestión de issues)
                </Typography>
              </Paper>

              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <Button 
                  variant="contained" 
                  size="large"
                  disabled={isNavigating}
                  onClick={() => {
                    setIsNavigating(true);
                    router.push('/viewer');
                  }}
                  sx={{
                    bgcolor: '#1F3A5F',
                    px: 6,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    textTransform: 'none',
                    '&:hover': { bgcolor: '#2B5DAF' }
                  }}
                >
                  {isNavigating ? <CircularProgress size={24} color="inherit" /> : 'Gestionar'}
                </Button>
              </Box>
            </Box>
          )}
      </Box>

      {/* Modales con Material UI */}
      <CreateProjectDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onCreate={handleCreateProject}
      />

      <EditProjectDialog
        project={editingProject}
        isOpen={showEditDialog}
        onClose={() => {
          setShowEditDialog(false);
          setEditingProject(null);
        }}
        onSave={handleUpdateProject}
        onDelete={handleDeleteProject}
      />
    </Box>
  );
}

console.log('✅ Dashboard actualizado - useAuth importado directamente');