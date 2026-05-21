/**
 * Estándares globales para el manejo de Incidencias (RDI / BCF)
 * Este archivo centraliza los valores permitidos para asegurar consistencia
 * entre el Visor 3D y el Dashboard.
 */

export const RDI_STANDARDS = {
  // Tipos de Incidencia
  types: [
    "Información",
    "Coordinación",
    "Interferencia",
    "Error",
    "Calidad",
    "Seguridad",
    "General"
  ],

  // Estados de la Incidencia
  statuses: [
    "Abierta",
    "Pendiente",
    "En progreso",
    "En revision",
    "Resuelta",
    "Cerrada"
  ],

  // Especialidades / Etiquetas
  labels: [
    "Arquitectura",
    "Estructura",
    "MEP",
    "Calculo",
    "Electricidad",
    "Sanitario",
    "Climatización",
    "Coordinación",
    "Obra",
    "General"
  ],

  // Usuarios predeterminados para asignación
  users: [
    "jonamorales@gmail.com",
    "coordinacion@gmail.com",
    "ingenieria@gmail.com"
  ],

  // Mapeo de llaves canónicas (Inglés) a etiquetas UI (Español)
  keys: {
    title: "Título",
    description: "Descripción",
    type: "Tipo",
    status: "Estado",
    label: "Especialidad",
    assignedTo: "Asignado a",
    dueDate: "Fecha Límite"
  }
};
