// src/pages/auth.jsx
// Esta página integra todo el sistema de autenticación

import { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useRouter } from 'next/router';

// Importa el componente LoginRegister que creamos
import LoginRegister from '../componentes/Auth/LoginRegister';

export default function AuthPage() {
  const router = useRouter();
  const authHook = useAuth();
  const { user, loading } = authHook;

  // 🔍 DIAGNÓSTICO COMPLETO
  useEffect(() => {
    console.log('═══════════════════════════════════════════');
    console.log('🔍 DIAGNÓSTICO COMPLETO DE AUTENTICACIÓN');
    console.log('═══════════════════════════════════════════');
    console.log('1️⃣ Estado de carga:', loading);
    console.log('2️⃣ Usuario autenticado:', !!user);
    if (user) {
      console.log('   └─ UID:', user.uid);
      console.log('   └─ Email:', user.email);
      console.log('   └─ Display Name:', user.displayName);
    }
    console.log('3️⃣ Hook de autenticación:', {
      hasLogin: typeof authHook.login === 'function',
      hasRegister: typeof authHook.register === 'function',
      hasLogout: typeof authHook.logout === 'function'
    });
    console.log('═══════════════════════════════════════════');
  }, [user, loading, authHook]);

  // ✅ TEST PASO 3.1: Redirigir al dashboard si ya está autenticado
  useEffect(() => {
    if (user && !loading) {
      console.log('═══════════════════════════════════════════');
      console.log('✅ PASO 3.1: Usuario autenticado detectado');
      console.log('  - Email:', user.email);
      console.log('  - UID:', user.uid);
      console.log('🔄 Redirigiendo a /dashboard...');
      console.log('═══════════════════════════════════════════');
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  // Mostrar loading mientras verifica autenticación
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{
          background: 'white',
          padding: '40px',
          borderRadius: '8px',
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#666', margin: 0 }}>Verificando autenticación...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Si no está autenticado, mostrar el formulario
  return <LoginRegister authHook={authHook} />;
}