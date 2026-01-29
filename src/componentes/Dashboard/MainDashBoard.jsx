// src/components/Dashboard/MainDashboard.jsx
// Dashboard principal con useAuth importado directamente

import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/router';

import { createProject, updateProject, deleteProject } from '../../utilitario/indexedDBManager';
import CreateProjectDialog from './CreateProjectDialog';
import EditProjectDialog from './EditProjectDialog';

import { IconButton, Tooltip, Button, Box, CircularProgress } from '@mui/material';
import { Edit } from '@mui/icons-material';
import { is } from 'date-fns/locale';
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

  const [isMobile, setIsMobile] = useState(false);

  // Detectar si es mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Overlay para mobile cuando el drawer está abierto */}
      {drawerOpen && isMobile && (
        <div
          onClick={() => setDrawerOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999
          }}
        />
      )}

      {/* Drawer Lateral - Responsive */}
      <div style={{
        // Mobile: Drawer flotante que cubre la pantalla
        // Desktop: Drawer lateral fijo
        position: isMobile ? 'fixed' : 'relative',
        left: 0,
        top: 0,
        height: '100vh',
        width: drawerOpen ? (isMobile ? '100%' : '280px') : '0',
        maxWidth: isMobile ? '300px' : '280px',
        background: '#1e1e2f',
        color: 'white',
        transition: 'width 0.3s',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        zIndex: isMobile ? 1000 : 'auto',
        boxShadow: isMobile && drawerOpen ? '2px 0 10px rgba(0,0,0,0.3)' : 'none'
      }}>
        {/* Header del Drawer */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>
            📊 Proyectos
          </h2>
        </div>

        {/* Lista de Proyectos */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '12px'
        }}>
          {loading ? (
            <p style={{ textAlign: 'center', color: '#888' }}>Cargando...</p>
          ) : projects.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <p style={{ color: '#888', marginBottom: '12px' }}>
                No tienes proyectos aún
              </p>
            </div>
          ) : (
            projects.map(project => (
              <div
                key={project.id}
                style={{
                  padding: '12px',
                  marginBottom: '8px',
                  background: currentProject?.id === project.id ? '#667eea' : 'rgba(255,255,255,0.05)',
                  borderRadius: '6px',
                  transition: 'background 0.2s',
                  border: currentProject?.id === project.id ? '2px solid #8899ff' : '1px solid transparent',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                {/* Contenido del proyecto - clickeable */}
                <div
                  onClick={() => handleSelectProject(project)}
                  style={{
                    flex: 1,
                    cursor: 'pointer',
                    paddingRight: '8px'
                  }}
                >
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                    {project.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#aaa' }}>
                    {new Date(project.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Botón de Editar */}
                {/* Botón de Editar con Material UI */}
                <Tooltip title="Editar proyecto">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('✏️ Abriendo edición para:', project.name);
                      setEditingProject(project);
                      setShowEditDialog(true);
                    }}
                    sx={{
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.2)'
                      }
                    }}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                </Tooltip>
              </div>
            ))
          )}
        </div>

        {/* Botón Crear Proyecto */}
        <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button
            onClick={() => setShowCreateDialog(true)}
            style={{
              width: '100%',
              padding: '12px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '14px'
            }}
          >
            ➕ Crear Proyecto
          </button>
        </div>
      </div>

      {/* Contenido Principal */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* AppBar Superior */}
        <div style={{
          height: '64px',
          background: '#ffffff',
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          {/* Botón Toggle Drawer */}
          <button
            onClick={() => setDrawerOpen(!drawerOpen)}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: 'black'
            }}
          >
            ☰
            {/* Texto solo visible en desktop */}
            {typeof window !== 'undefined' && !isMobile && (
              <span style={{ fontSize: '14px' }}>Proyectos</span>
            )}
          </button>

         

          {/* Usuario y Logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: '#667eea',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold'
            }}>
              {user.displayName?.[0] || user.email[0].toUpperCase()}
            </div>

            <div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>
                {user.displayName || 'Usuario'}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {user.email}
              </div>
            </div>

            <button
              onClick={handleLogout}
              disabled={logoutLoading}
              style={{
                padding: '8px 16px',
                background: logoutLoading ? '#999' : '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: logoutLoading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                transition: 'background 0.3s',
                minWidth: '80px'
              }}
            >
              {logoutLoading ? '...' : '🚪 Salir'}
            </button>
          </div>
        </div>

        {/* Área de Contenido */}
        <div style={{
          flex: 1,
          padding: '24px',
          overflowY: 'auto',
          background: '#f5f5f5'
        }}>
          {!currentProject ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              gap: '24px'
            }}>
              <div style={{ fontSize: '64px' }}>📂</div>
              <h2 style={{ color: '#666', margin: 0 }}>
                No hay proyecto seleccionado
              </h2>
              <p style={{ color: '#999' }}>
                Selecciona un proyecto del menú lateral o crea uno nuevo
              </p>
              <button
                onClick={() => setShowCreateDialog(true)}
                style={{
                  padding: '12px 24px',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                ➕ Crear Primer Proyecto
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
              <h2 style={{ marginTop: 0, color: '#333' }}>
                Proyecto: {currentProject.name}
              </h2>
              <div style={{
                background: 'white',
                padding: '24px',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                flex: 1
              }}>
                <p style={{ color: '#666' }}>
                  Aquí se mostrarán los issues del proyecto.
                </p>
                <p style={{ color: '#999', fontSize: '14px' }}>
                  (Próximo paso: Implementar gestión de issues)
                </p>
              </div>

              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  size="large"
                  disabled={isNavigating}
                  onClick={() => {
                    setIsNavigating(true);
                    router.push('/viewer');
                  }}
                >
                  {isNavigating ? <CircularProgress size={24} color="inherit" /> : 'Gestionar'}
                </Button>
              </Box>
            </div>
          )}
        </div>
      </div>

      {/* Dialog Crear Proyecto */}
      {showCreateDialog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '32px',
            borderRadius: '8px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
          }}>
            <h2 style={{ marginTop: 0, marginBottom: '24px' }}>
              Crear Nuevo Proyecto
            </h2>

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#555'
              }}>
                Nombre del Proyecto
              </label>
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newProjectName.trim()) {
                    handleCreateProject();
                  }
                }}
                placeholder="Ej: Proyecto ABC"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
                autoFocus
              />
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => {
                  setShowCreateDialog(false);
                  setNewProjectName('');
                }}
                style={{
                  padding: '10px 20px',
                  background: '#e0e0e0',
                  color: '#333',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateProject}
                disabled={!newProjectName.trim()}
                style={{
                  padding: '10px 20px',
                  background: newProjectName.trim() ? '#667eea' : '#ccc',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: newProjectName.trim() ? 'pointer' : 'not-allowed',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                Crear Proyecto
              </button>
            </div>
          </div>
        </div>
      )}
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
    </div>
  );
}

console.log('✅ Dashboard actualizado - useAuth importado directamente');