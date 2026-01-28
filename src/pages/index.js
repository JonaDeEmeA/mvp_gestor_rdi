// src/pages/index.js
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useRouter } from 'next/router';

export default function LandingPage() {
  const router = useRouter();
  const { user, loading, register, login } = useAuth();
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');

  // Formulario de crear proyecto + registro
  const [projectForm, setProjectForm] = useState({
    projectName: '',
    userName: '',
    email: '',
    password: ''
  });

  // Formulario de login
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (user && !loading) {
      console.log('✅ Usuario autenticado, redirigiendo a dashboard');
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  // Handler para crear proyecto (incluye registro)
  const handleCreateProject = async () => {
    console.log('➕ Creando proyecto y registrando usuario:', projectForm.email);
    setError('');

    // Validaciones
    if (!projectForm.projectName.trim()) {
      setError('El nombre del proyecto es requerido');
      return;
    }
    if (!projectForm.email || !projectForm.password) {
      setError('Email y contraseña son requeridos');
      return;
    }
    if (projectForm.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setFormLoading(true);

    try {
      // 1. Registrar usuario
      const result = await register(
        projectForm.email, 
        projectForm.password, 
        projectForm.userName
      );

      if (!result.success) {
        setError(result.error);
        setFormLoading(false);
        return;
      }

      // 2. Guardar nombre del proyecto en localStorage temporalmente
      localStorage.setItem('pendingProject', projectForm.projectName);

      console.log('✅ Usuario registrado, redirigiendo a dashboard');
      // El useEffect manejará la redirección
    } catch (err) {
      console.error('❌ Error:', err);
      setError('Error inesperado: ' + err.message);
      setFormLoading(false);
    }
  };

  // Handler para login
  const handleLogin = async () => {
    console.log('🔐 Login:', loginForm.email);
    setError('');

    if (!loginForm.email || !loginForm.password) {
      setError('Email y contraseña son requeridos');
      return;
    }

    setFormLoading(true);

    try {
      const result = await login(loginForm.email, loginForm.password);

      if (!result.success) {
        setError(result.error);
        setFormLoading(false);
        return;
      }

      console.log('✅ Login exitoso, redirigiendo a dashboard');
      // El useEffect manejará la redirección
    } catch (err) {
      console.error('❌ Error:', err);
      setError('Error inesperado: ' + err.message);
      setFormLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ color: 'white', fontSize: '18px' }}>Cargando...</div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative'
    }}>
      {/* Botón Login - Esquina superior derecha */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        zIndex: 10
      }}>
        <button
          onClick={() => setShowLoginModal(true)}
          style={{
            padding: '10px 24px',
            background: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            border: '2px solid white',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s'
          }}
          onMouseOver={(e) => {
            e.target.style.background = 'white';
            e.target.style.color = '#667eea';
          }}
          onMouseOut={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.2)';
            e.target.style.color = 'white';
          }}
        >
          Iniciar Sesión
        </button>
      </div>

      {/* Contenido Central */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <h1 style={{
          color: 'white',
          fontSize: '48px',
          fontWeight: 'bold',
          marginBottom: '16px',
          textAlign: 'center'
        }}>
          Sistema de Gestión de Proyectos
        </h1>
        
        <p style={{
          color: 'rgba(255, 255, 255, 0.9)',
          fontSize: '20px',
          marginBottom: '48px',
          textAlign: 'center'
        }}>
          Organiza tus proyectos y gestiona issues de forma eficiente
        </p>

        <button
          onClick={() => setShowCreateProjectModal(true)}
          style={{
            padding: '16px 48px',
            background: 'white',
            color: '#667eea',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '20px',
            fontWeight: 'bold',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
            transition: 'transform 0.2s'
          }}
          onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
        >
          ➕ Crear Proyecto
        </button>
      </div>

      {/* Modal - Crear Proyecto */}
      {showCreateProjectModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            padding: '32px',
            borderRadius: '12px',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
          }}>
            <h2 style={{ marginTop: 0, marginBottom: '24px', color: '#333' }}>
              Crear Nuevo Proyecto
            </h2>

            {error && (
              <div style={{
                padding: '12px',
                background: '#ffebee',
                color: '#c62828',
                borderRadius: '4px',
                marginBottom: '16px'
              }}>
                {error}
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Nombre del Proyecto *
              </label>
              <input
                type="text"
                value={projectForm.projectName}
                onChange={(e) => setProjectForm({...projectForm, projectName: e.target.value})}
                placeholder="Mi Proyecto"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Tu Nombre (opcional)
              </label>
              <input
                type="text"
                value={projectForm.userName}
                onChange={(e) => setProjectForm({...projectForm, userName: e.target.value})}
                placeholder="Juan Pérez"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Email *
              </label>
              <input
                type="email"
                value={projectForm.email}
                onChange={(e) => setProjectForm({...projectForm, email: e.target.value})}
                placeholder="tu@email.com"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Contraseña *
              </label>
              <input
                type="password"
                value={projectForm.password}
                onChange={(e) => setProjectForm({...projectForm, password: e.target.value})}
                placeholder="Mínimo 6 caracteres"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => {
                  setShowCreateProjectModal(false);
                  setProjectForm({ projectName: '', userName: '', email: '', password: '' });
                  setError('');
                }}
                disabled={formLoading}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#e0e0e0',
                  color: '#333',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: formLoading ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateProject}
                disabled={formLoading}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: formLoading ? '#999' : '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: formLoading ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                {formLoading ? 'Creando...' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Login */}
      {showLoginModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            padding: '32px',
            borderRadius: '12px',
            maxWidth: '400px',
            width: '100%',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
          }}>
            <h2 style={{ marginTop: 0, marginBottom: '24px', color: '#333' }}>
              Iniciar Sesión
            </h2>

            {error && (
              <div style={{
                padding: '12px',
                background: '#ffebee',
                color: '#c62828',
                borderRadius: '4px',
                marginBottom: '16px'
              }}>
                {error}
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Email
              </label>
              <input
                type="email"
                value={loginForm.email}
                onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                placeholder="tu@email.com"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Contraseña
              </label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleLogin();
                }}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => {
                  setShowLoginModal(false);
                  setLoginForm({ email: '', password: '' });
                  setError('');
                }}
                disabled={formLoading}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#e0e0e0',
                  color: '#333',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: formLoading ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleLogin}
                disabled={formLoading}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: formLoading ? '#999' : '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: formLoading ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                {formLoading ? 'Ingresando...' : 'Ingresar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}