// src/pages/index.js
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useRouter } from 'next/router';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';

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

  if (loading || user) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #1F3A5F 0%, #4CAF50 100%)'
      }}>
        <div style={{ color: 'white', fontSize: '18px' }}>Cargando...</div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1F3A5F 50%, #4CAF50 50%)',
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
        <Button
          onClick={() => setShowLoginModal(true)}
          variant="outlined"
          sx={{
            padding: '8px 30px',
            background: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            border: '2px solid white',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: 'bold',
            backdropFilter: 'blur(10px)',
            textTransform: 'none',
            transition: 'all 0.3s',
            '&:hover': {
              background: 'white',
              color: '#1F3A5F',
              border: '2px solid white'
            }
          }}
        >
          Iniciar Sesión
        </Button>
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

        <Button
          onClick={() => setShowCreateProjectModal(true)}
          variant="contained"
          startIcon={<AddIcon />}
          sx={{
            padding: '12px 30px',
            background: 'white',
            color: '#1F3A5F',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',

            textTransform: 'none',
            transition: 'transform 0.2s',
            '&:hover': {
              background: 'white',
              transform: 'scale(1.05)'
            }
          }}
        >
          Crear Proyecto
        </Button>
      </div>

      {/* Modal - Crear Proyecto */}
      {showCreateProjectModal && (
        <div
          onClick={() => setShowCreateProjectModal(false)}
          style={{
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
          }}
        >
          <Paper
            onClick={(e) => e.stopPropagation()}
            elevation={24}
            sx={{
              borderRadius: '12px',
              maxWidth: '500px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '90vh'
            }}
          >
            <Box sx={{ padding: '24px 24px 8px' }}>
              <Typography variant="h6" component="h2" sx={{
                color: '#1E1E1E',
                fontWeight: 'bold',
                fontSize: '24px'
              }}>
                Crear Nuevo Proyecto
              </Typography>
            </Box>

            <Box sx={{ padding: '0 24px', overflowY: 'auto' }}>
              {error && (
                <Alert severity="error" sx={{
                  mb: 2,
                  backgroundColor: '#FDECEA',
                  color: '#D32F2F',
                  '& .MuiAlert-icon': { color: '#D32F2F' }
                }}>
                  {error}
                </Alert>
              )}

              <TextField
                autoFocus
                margin="dense"
                label="Nombre del Proyecto"
                type="text"
                fullWidth
                variant="outlined"
                value={projectForm.projectName}
                onChange={(e) => setProjectForm({ ...projectForm, projectName: e.target.value })}
                required
                sx={{
                  mb: 2,
                  '& label.Mui-focused': { color: '#1F3A5F' },
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': { borderColor: '#1F3A5F' }
                  },
                  '& input:-webkit-autofill': {
                    WebkitBoxShadow: '0 0 0 1000px white inset',
                    WebkitTextFillColor: '#1E1E1E',
                  }
                }}
              />

              <TextField
                margin="dense"
                label="Tu Nombre (opcional)"
                type="text"
                fullWidth
                variant="outlined"
                value={projectForm.userName}
                onChange={(e) => setProjectForm({ ...projectForm, userName: e.target.value })}
                sx={{
                  mb: 2,
                  '& label.Mui-focused': { color: '#1F3A5F' },
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': { borderColor: '#1F3A5F' }
                  },
                  '& input:-webkit-autofill': {
                    WebkitBoxShadow: '0 0 0 1000px white inset',
                    WebkitTextFillColor: '#1E1E1E',
                  }
                }}
              />

              <TextField
                margin="dense"
                label="Email"
                type="email"
                fullWidth
                variant="outlined"
                value={projectForm.email}
                onChange={(e) => setProjectForm({ ...projectForm, email: e.target.value })}
                required
                sx={{
                  mb: 2,
                  '& label.Mui-focused': { color: '#1F3A5F' },
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': { borderColor: '#1F3A5F' }
                  },
                  '& input:-webkit-autofill': {
                    WebkitBoxShadow: '0 0 0 1000px white inset',
                    WebkitTextFillColor: '#1E1E1E',
                  }
                }}
              />

              <TextField
                margin="dense"
                label="Contraseña"
                type="password"
                fullWidth
                variant="outlined"
                value={projectForm.password}
                onChange={(e) => setProjectForm({ ...projectForm, password: e.target.value })}
                required
                helperText="Mínimo 6 caracteres"
                sx={{
                  '& label.Mui-focused': { color: '#1F3A5F' },
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': { borderColor: '#1F3A5F' }
                  },
                  '& input:-webkit-autofill': {
                    WebkitBoxShadow: '0 0 0 1000px white inset',
                    WebkitTextFillColor: '#1E1E1E',
                  }
                }}
              />
            </Box>

            <Box sx={{ padding: '16px 24px 24px', display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button
                onClick={() => {
                  setShowCreateProjectModal(false);
                  setProjectForm({ projectName: '', userName: '', email: '', password: '' });
                  setError('');
                }}
                disabled={formLoading}
                sx={{
                  color: '#5F6B7A',
                  fontWeight: 'bold',
                  textTransform: 'none',
                  '&:hover': { backgroundColor: '#F5F7FA' }
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateProject}
                disabled={formLoading}
                variant="contained"
                sx={{
                  backgroundColor: '#1F3A5F',
                  color: 'white',
                  fontWeight: 'bold',
                  textTransform: 'none',
                  padding: '8px 24px',
                  '&:hover': { backgroundColor: '#2B5DAF' },
                  '&:disabled': { backgroundColor: '#9AA4AF' }
                }}
              >
                {formLoading ? 'Creando...' : 'Crear'}
              </Button>
            </Box>
          </Paper>
        </div>
      )}

      {/* Modal - Login */}
      {showLoginModal && (
        <div
          onClick={() => setShowLoginModal(false)}
          style={{
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
          }}
        >
          <Paper
            onClick={(e) => e.stopPropagation()}
            elevation={24}
            sx={{
              borderRadius: '12px',
              maxWidth: '400px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '90vh'
            }}
          >
            <Box sx={{ padding: '24px 24px 8px' }}>
              <Typography variant="h6" component="h2" sx={{
                color: '#1E1E1E',
                fontWeight: 'bold',
                fontSize: '24px'
              }}>
                Iniciar Sesión
              </Typography>
            </Box>

            <Box sx={{ padding: '0 24px', overflowY: 'auto' }}>
              {error && (
                <Alert severity="error" sx={{
                  mb: 2,
                  backgroundColor: '#FDECEA',
                  color: '#D32F2F',
                  '& .MuiAlert-icon': { color: '#D32F2F' }
                }}>
                  {error}
                </Alert>
              )}

              <TextField
                autoFocus
                margin="dense"
                label="Email"
                type="email"
                fullWidth
                variant="outlined"
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                sx={{
                  mb: 2,
                  '& label.Mui-focused': { color: '#1F3A5F' },
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': { borderColor: '#1F3A5F' }
                  },
                  '& input:-webkit-autofill': {
                    WebkitBoxShadow: '0 0 0 1000px white inset',
                    WebkitTextFillColor: '#1E1E1E',
                  }
                }}
              />

              <TextField
                margin="dense"
                label="Contraseña"
                type="password"
                fullWidth
                variant="outlined"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleLogin();
                }}
                sx={{
                  '& label.Mui-focused': { color: '#1F3A5F' },
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': { borderColor: '#1F3A5F' }
                  },
                  '& input:-webkit-autofill': {
                    WebkitBoxShadow: '0 0 0 1000px white inset',
                    WebkitTextFillColor: '#1E1E1E',
                  }
                }}
              />
            </Box>

            <Box sx={{ padding: '16px 24px 24px', display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button
                onClick={() => {
                  setShowLoginModal(false);
                  setLoginForm({ email: '', password: '' });
                  setError('');
                }}
                disabled={formLoading}
                sx={{
                  color: '#5F6B7A',
                  fontWeight: 'bold',
                  textTransform: 'none',
                  '&:hover': { backgroundColor: '#F5F7FA' }
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleLogin}
                disabled={formLoading}
                variant="contained"
                sx={{
                  backgroundColor: '#1F3A5F',
                  color: 'white',
                  fontWeight: 'bold',
                  textTransform: 'none',
                  padding: '8px 24px',
                  '&:hover': { backgroundColor: '#2B5DAF' },
                  '&:disabled': { backgroundColor: '#9AA4AF', color: 'white' }
                }}
              >
                {formLoading ? 'Ingresando...' : 'Ingresar'}
              </Button>
            </Box>
          </Paper>
        </div>
      )}
    </div>
  );
}