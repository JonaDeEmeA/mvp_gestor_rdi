// src/config/firebase.js

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// 🔧 Configuración de Firebase
// IMPORTANTE: Reemplazar con tus credenciales reales de Firebase Console
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBUZ6MIwfj5tc5VY_9dqhF7h05TlttL4QE",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "bimnodo-54ad1.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "bimnodo-54ad1",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "bimnodo-54ad1.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "401946093593",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:401946093593:web:f2411ce1cfa254cdd76288"
};

// ✅ TEST PASO 1: Verificar configuración
console.log('🔥 Firebase Config loaded:', {
  hasApiKey: !!firebaseConfig.apiKey,
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain
});

// 🔍 DIAGNÓSTICO: Verificar que las variables de entorno se cargaron
if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'TU_API_KEY') {
  console.error('❌ ERROR CRÍTICO: Firebase no está configurado correctamente');
  console.error('📝 Acción requerida: Configura el archivo .env.local con tus credenciales');
  console.error('💡 Ejemplo: NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...');
}

// Inicializar Firebase
let app;
let auth;
let db;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  
  console.log('✅ PASO 1 COMPLETADO: Firebase inicializado correctamente');
} catch (error) {
  console.error('❌ Error inicializando Firebase:', error);
}

export { app, auth, db };