// src/hooks/useAnalytics.js

import { useAuth } from './useAuth';
import { auth } from '../config/firebase';
import { analyticsService } from '../services/analyticsService';

/**
 * Hook para facilitar el envío de eventos de analítica desde componentes React.
 * Inyecta automáticamente los datos del usuario actual.
 */
export const useAnalytics = () => {
  const { user } = useAuth();

  /**
   * Helper para obtener el usuario mas actualizado.
   * Si 'user' de useAuth todavia es null (por carga inicial),
   * intentamos obtenerlo directamente de la instancia de Firebase.
   */
  const getCurrentUser = () => {
    if (user) return user;
    // Fallback directo a Firebase por si el estado todavia no se ha propagado
    return auth.currentUser;
  };

  const trackAction = async (eventName, params = {}) => {
    return analyticsService.trackEvent(eventName, getCurrentUser(), params);
  };

  const trackModelLoad = async (fileName, fileSize) => {
    return analyticsService.trackModelLoad(getCurrentUser(), fileName, fileSize);
  };

  const trackRDIAction = async (action, rdiId) => {
    return analyticsService.trackRDIAction(action, getCurrentUser(), rdiId);
  };

  return {
    trackAction,
    trackModelLoad,
    trackRDIAction
  };
};
