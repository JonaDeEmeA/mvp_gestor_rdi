import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

export default function LoginRegister() {
  const authHook = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: ''
  });
  const [localError, setLocalError] = useState('');
  const [loading, setLoading] = useState(false);

  // 🔍 DIAGNÓSTICO PASO 2.1: Verificar que authHook esté disponible
  console.log('🔍 PASO 2.1 DIAGNÓSTICO: authHook recibido:', !!authHook);
  
  if (!authHook) {
    console.error('❌ ERROR CRÍTICO: authHook no está disponible');
    console.error('📝 Solución: Pasar authHook como prop desde el componente padre');
    return (
      <div style={{ padding: '20px', background: '#ffebee', color: '#c62828' }}>
        <h2>Error de Configuración</h2>
        <p>El hook de autenticación no está disponible. Verifica la configuración.</p>
      </div>
    );
  }

  const { login, register } = authHook;

  const handleTabChange = (newValue) => {
    console.log('🔄 PASO 4.1: Cambiando a tab:', newValue === 0 ? 'Login' : 'Registro');
    setTabValue(newValue);
    setLocalError('');
    setFormData({ email: '', password: '', displayName: '' });
  };

  const handleInputChange = (field, value) => {
    console.log(`📝 PASO 4.2: Campo ${field} actualizado`);
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setLocalError('');
  };

  const handleLogin = async () => {
    console.log('🔐 PASO 4.3: Iniciando login para:', formData.email);
    console.log('🔍 DIAGNÓSTICO: Tipo de función login:', typeof login);
    
    if (!formData.email || !formData.password) {
      setLocalError('Por favor completa todos los campos');
      return;
    }
    
    setLoading(true);
    setLocalError('');
    
    try {
      console.log('📡 PASO 4.3.1: Llamando a login() con email:', formData.email);
      const result = await login(formData.email, formData.password);
      
      console.log('📥 PASO 4.3.2: Resultado de login:', result);
      
      setLoading(false);
      
      if (!result.success) {
        console.error('❌ Error en login:', result.error);
        setLocalError(result.error || 'Error desconocido al iniciar sesión');
      } else {
        console.log('✅ PASO 4.3 COMPLETADO: Login exitoso');
      }
    } catch (error) {
      console.error('❌ EXCEPCIÓN en login:', error);
      setLocalError('Error inesperado: ' + error.message);
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    console.log('📝 PASO 4.4: Iniciando registro para:', formData.email);
    console.log('🔍 DIAGNÓSTICO: Tipo de función register:', typeof register);
    
    if (!formData.email || !formData.password) {
      setLocalError('Por favor completa todos los campos');
      return;
    }
    
    if (formData.password.length < 6) {
      setLocalError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    setLoading(true);
    setLocalError('');
    
    try {
      console.log('📡 PASO 4.4.1: Llamando a register() con email:', formData.email);
      const result = await register(
        formData.email, 
        formData.password, 
        formData.displayName
      );
      
      console.log('📥 PASO 4.4.2: Resultado de register:', result);
      
      setLoading(false);
      
      if (!result.success) {
        console.error('❌ Error en registro:', result.error);
        setLocalError(result.error || 'Error desconocido al registrar');
      } else {
        console.log('✅ PASO 4.4 COMPLETADO: Registro exitoso');
        console.log('👤 Usuario creado con UID:', result.user?.uid);
      }
    } catch (error) {
      console.error('❌ EXCEPCIÓN en register:', error);
      setLocalError('Error inesperado: ' + error.message);
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '16px'
    }}>
      <div style={{
        maxWidth: '480px',
        width: '100%',
        background: 'white',
        borderRadius: '8px',
        padding: '32px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        {/* Header */}
        <h1 style={{
          textAlign: 'center',
          marginBottom: '24px',
          fontSize: '32px',
          fontWeight: 'bold',
          color: '#333'
        }}>
          Sistema de Proyectos
        </h1>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #e0e0e0',
          marginBottom: '24px'
        }}>
          <button
            onClick={() => handleTabChange(0)}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              background: 'transparent',
              borderBottom: tabValue === 0 ? '2px solid #667eea' : 'none',
              color: tabValue === 0 ? '#667eea' : '#666',
              fontWeight: tabValue === 0 ? 'bold' : 'normal',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => handleTabChange(1)}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              background: 'transparent',
              borderBottom: tabValue === 1 ? '2px solid #667eea' : 'none',
              color: tabValue === 1 ? '#667eea' : '#666',
              fontWeight: tabValue === 1 ? 'bold' : 'normal',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Registrarse
          </button>
        </div>

        {/* Error Alert */}
        {localError && (
          <div style={{
            padding: '12px',
            background: '#ffebee',
            color: '#c62828',
            borderRadius: '4px',
            marginBottom: '16px',
            border: '1px solid #ef5350'
          }}>
            {localError}
          </div>
        )}

        {/* Login Form */}
        {tabValue === 0 && (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#555'
              }}>
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
                placeholder="tu@email.com"
                required
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#555'
              }}>
                Contraseña
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleLogin();
                  }
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
                placeholder="••••••••"
                required
              />
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                background: loading ? '#999' : '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.3s'
              }}
            >
              {loading ? 'Cargando...' : 'Iniciar Sesión'}
            </button>
          </div>
        )}

        {/* Register Form */}
        {tabValue === 1 && (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#555'
              }}>
                Nombre (opcional)
              </label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => handleInputChange('displayName', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
                placeholder="Tu nombre"
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#555'
              }}>
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
                placeholder="tu@email.com"
                required
              />
            </div>

            <div style={{ marginBottom: '8px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#555'
              }}>
                Contraseña
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleRegister();
                  }
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
                placeholder="••••••••"
                required
              />
              <small style={{
                display: 'block',
                marginTop: '4px',
                color: '#666',
                fontSize: '12px'
              }}>
                Mínimo 6 caracteres
              </small>
            </div>

            <button
              onClick={handleRegister}
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                background: loading ? '#999' : '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginTop: '16px',
                transition: 'background 0.3s'
              }}
            >
              {loading ? 'Cargando...' : 'Crear Cuenta'}
            </button>
          </div>
        )}

        {/* Footer */}
        <p style={{
          textAlign: 'center',
          marginTop: '24px',
          fontSize: '12px',
          color: '#999'
        }}>
          Sistema MVP - Autenticación con Firebase
        </p>
      </div>
    </div>
  );
}