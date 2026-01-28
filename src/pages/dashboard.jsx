// src/pages/dashboard.jsx
// Página principal del dashboard con autenticación

import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useRouter } from 'next/router';
import Dashboard from '../componentes/Dashboard/MainDashBoard';

// Importar funciones de IndexedDB
import { getProjectsByUser } from '../utilitario/indexedDBManager';

export default function DashboardPage() {
  const router = useRouter();
  const authHook = useAuth();
  const { user, loading } = authHook;
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);

  // 🔍 DIAGNÓSTICO COMPLETO
  useEffect(() => {
    console.log('═══════════════════════════════════════════');
    console.log('🔍 DIAGNÓSTICO - DASHBOARD PAGE');
    console.log('═══════════════════════════════════════════');
    console.log('1️⃣ Loading:', loading);
    console.log('2️⃣ Usuario:', user ? {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName
    } : 'No autenticado');
    console.log('═══════════════════════════════════════════');
  }, [user, loading]);

  // ✅ TEST PASO 2.1: Proteger ruta - Redirigir si no está autenticado
  useEffect(() => {
    if (!loading && !user) {
      console.log('⚠️ PASO 2.1: Usuario no autenticado, redirigiendo a /');
      router.push('/');
    }
  }, [user, loading, router]);

  // ✅ TEST PASO 2.2: Cargar proyectos del usuario
  useEffect(() => {
    if (user) {
      loadUserProjects();
    }
  }, [user]);

  const loadUserProjects = async () => {
    console.log('📂 PASO 2.2: Cargando proyectos para:', user.email);
    setProjectsLoading(true);
    
    try {
      const userProjects = await getProjectsByUser(user.email);
      console.log('✅ PASO 2.2 COMPLETADO: Proyectos cargados:', userProjects.length);
      setProjects(userProjects);
    } catch (error) {
      console.error('❌ Error cargando proyectos:', error);
      setProjects([]);
    } finally {
      setProjectsLoading(false);
    }
  };

  // ✅ Manejar proyecto pendiente de creación
useEffect(() => {
  if (user && !projectsLoading) {
    const pendingProject = localStorage.getItem('pendingProject');
    
    if (pendingProject) {
      console.log('📂 Proyecto pendiente detectado:', pendingProject);
      
      // Crear el proyecto automáticamente
      createProjectFromPending(pendingProject);
      
      // Limpiar localStorage
      localStorage.removeItem('pendingProject');
    }
  }
}, [user, projectsLoading]);

const createProjectFromPending = async (projectName) => {
  console.log('➕ Creando proyecto pendiente:', projectName);
  
  try {
    // TODO: Aquí irá la llamada real a IndexedDB cuando la implementemos
    const newProject = {
      id: Date.now(),
      name: projectName,
      userEmail: user.email,
      createdAt: new Date().toISOString()
    };
    
    console.log('✅ Proyecto creado desde registro:', newProject);
    
    // Recargar proyectos
    await loadUserProjects();
  } catch (error) {
    console.error('❌ Error creando proyecto pendiente:', error);
  }
};

  // Mostrar loading mientras verifica autenticación
  if (loading || projectsLoading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#f5f5f5'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          border: '6px solid #f3f3f3',
          borderTop: '6px solid #667eea',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ 
          marginTop: '20px', 
          color: '#666',
          fontSize: '16px' 
        }}>
          {loading ? 'Verificando autenticación...' : 'Cargando proyectos...'}
        </p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Si no hay usuario, no mostrar nada (el useEffect redirigirá)
  if (!user) {
    return null;
  }

  // Mostrar dashboard
  // ✅ Ya no necesitamos pasar authHook como prop
  // El componente Dashboard importa useAuth directamente
  return <Dashboard userProjects={projects} />;
}