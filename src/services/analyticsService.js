// src/services/analyticsService.js

/**
 * Capa de Analítica de Eventos (Event Analytics Layer)
 * Se encarga de enviar eventos a un endpoint de AppScript para su registro en Google Sheets u otros destinos.
 */

const ANALYTICS_ENDPOINT = process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT;

class AnalyticsService {
  /**
   * Envía un evento al endpoint configurado
   * @param {string} eventName - Nombre del evento (ej: 'login', 'logout', 'model_loaded')
   * @param {Object} userData - Información del usuario actual
   * @param {Object} additionalParams - Parámetros extra para el evento
   */
  async trackEvent(eventName, userData = null, additionalParams = {}) {
    if (!ANALYTICS_ENDPOINT) {
      console.warn('⚠️ Analytics: NEXT_PUBLIC_ANALYTICS_ENDPOINT no configurado. El evento no será registrado.');
      return;
    }

    const payload = {
      timestamp: new Date().toISOString(),
      event: eventName,
      user_email: userData?.email || 'anonymous',
      user_uid: userData?.uid || 'anonymous',
      user_name: userData?.displayName || 'anonymous',
      ...additionalParams,
      browser: typeof window !== 'undefined' ? navigator.userAgent : 'server',
      url: typeof window !== 'undefined' ? window.location.href : 'N/A'
    };

    console.group(`📊 Analytics Event: ${eventName}`);
    console.log('Payload:', payload);
    console.groupEnd();

    try {
      // Usamos fetch con 'no-cors' si el script de Google no maneja preflight OPTIONS correctamente,
      // pero esto impide ver la respuesta. Si el script está bien configurado, 'cors' es mejor.
      // Generalmente para logs, 'no-cors' evita muchos dolores de cabeza con Google Scripts.
      // Para Google AppScript con 'no-cors', lo más fiable es enviar el JSON como texto plano
      // Esto evita que el navegador haga una petición OPTIONS (preflight) que AppScript no soporta bien.
      const response = await fetch(ANALYTICS_ENDPOINT, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain', // Mantenemos simple para evitar preflight
        },
        body: JSON.stringify(payload),
      });

      // Nota: Con 'no-cors', response.ok será siempre false y no podemos leer el cuerpo.
      // Pero el evento llega al script.
      return { success: true };
    } catch (error) {
      console.error('❌ Error enviando evento de analítica:', error);
      return { success: false, error };
    }
  }

  // Métodos de conveniencia para eventos comunes
  async trackLogin(userData) {
    return this.trackEvent('login', userData);
  }

  async trackLogout(userData) {
    return this.trackEvent('logout', userData);
  }

  async trackModelLoad(userData, fileName, fileSize) {
    return this.trackEvent('model_loaded', userData, { fileName, fileSize });
  }

  async trackRDIAction(action, userData, rdiId) {
    return this.trackEvent(`rdi_${action}`, userData, { rdiId });
  }
}

export const analyticsService = new AnalyticsService();
