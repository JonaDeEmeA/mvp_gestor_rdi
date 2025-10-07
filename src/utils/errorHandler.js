/**
 * Muestra un mensaje de error al usuario
 * @param {string} message - Mensaje de error
 * @param {Error} error - Error original (opcional)
 */
export const showErrorMessage = (message, error = null) => {
  const fullMessage = error ? `${message}: ${error.message}` : message;
  console.error(fullMessage, error);
  alert(fullMessage);
};