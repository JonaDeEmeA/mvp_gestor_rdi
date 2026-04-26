// src/hooks/useAuth.js

import { useState, useEffect, createContext, useContext } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { analyticsService } from '../services/analyticsService';


// Context para compartir estado de autenticación
const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ TEST PASO 2.1: Escuchar cambios de autenticación
  useEffect(() => {
    console.log('🔄 PASO 2.1: Iniciando listener de autenticación...');
    let isFirstCheck = true;
    
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log('👤 Estado de usuario:', currentUser ? {
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName
      } : 'No autenticado');
      
      setUser(currentUser);
      setLoading(false);

      // ✅ Registramos la apertura solo después de que Firebase nos diga el estado inicial
      if (isFirstCheck) {
        analyticsService.trackEvent('app_opened', currentUser);
        isFirstCheck = false;
      }
    });

    return () => {
      console.log('🛑 Cerrando listener de autenticación');
      unsubscribe();
    };
  }, []);

  // 📝 Registro de nuevo usuario
  const register = async (email, password, displayName = '') => {
    console.log('📝 PASO 2.2: Intentando registrar usuario:', email);
    setError(null);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Actualizar nombre de usuario si se proporciona
      if (displayName && userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
        console.log('✅ Perfil actualizado con nombre:', displayName);
      }

      console.log('✅ PASO 2.2 COMPLETADO: Usuario registrado:', userCredential.user.uid);
      return { success: true, user: userCredential.user };

    } catch (err) {
      console.error('❌ Error en registro:', err.code, err.message);
      setError(getErrorMessage(err.code));
      return { success: false, error: getErrorMessage(err.code) };
    }
  };

  // 🔐 Login de usuario
  const login = async (email, password) => {
    console.log('🔐 PASO 2.3: Intentando login:', email);
    setError(null);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ PASO 2.3 COMPLETADO: Login exitoso:', userCredential.user.uid);

      // 📊 Track successful login
      analyticsService.trackLogin(userCredential.user);

      return { success: true, user: userCredential.user };

    } catch (err) {
      console.error('❌ Error en login:', err.code, err.message);
      setError(getErrorMessage(err.code));
      return { success: false, error: getErrorMessage(err.code) };
    }
  };

  // 🚪 Logout
  const logout = async () => {
    console.log('🚪 PASO 2.4: Cerrando sesión...');
    setError(null);

    try {
      // 📊 Track logout BEFORE signing out to keep user info
      if (user) {
        analyticsService.trackLogout(user);
      }

      await signOut(auth);
      console.log('✅ PASO 2.4 COMPLETADO: Sesión cerrada');
      return { success: true };

    } catch (err) {
      console.error('❌ Error en logout:', err.message);
      setError('Error al cerrar sesión');
      return { success: false, error: 'Error al cerrar sesión' };
    }
  };

  // 📊 Mensajes de error en español
  const getErrorMessage = (errorCode) => {
    const errorMessages = {
      'auth/email-already-in-use': 'Este email ya está registrado',
      'auth/invalid-email': 'Email inválido',
      'auth/operation-not-allowed': 'Operación no permitida',
      'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
      'auth/user-disabled': 'Usuario deshabilitado',
      'auth/user-not-found': 'Usuario no encontrado',
      'auth/wrong-password': 'Contraseña incorrecta',
      'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
      'auth/network-request-failed': 'Error de conexión',
    };

    return errorMessages[errorCode] || 'Error desconocido';
  };

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    isAuthenticated: !!user
  };

  console.log('✅ PASO 2 COMPLETADO: AuthProvider configurado');

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};