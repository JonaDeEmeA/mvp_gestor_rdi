# Documentación del Proyecto: Visor ThatOpen

## Arquitectura General

El proyecto está construido sobre el framework **Next.js 15**, utilizando una arquitectura basada en componentes con una clara separación de responsabilidades a través de capas de servicios y hooks personalizados.

### Patrón de Arquitectura
Se sigue un patrón de **Arquitectura de Componentes con Capas de Servicio**:
1.  **Capa de Componentes (UI)**: React Components (usando Material UI) que se encargan de la presentación y la interacción directa con el usuario.
2.  **Capa de Hooks (Lógica de Estado)**: Hooks personalizados en `src/hooks` que gestionan el estado local/global y actúan como puente entre la UI y los servicios.
3.  **Capa de Servicios (Lógica de Dominio)**: Módulos en `src/services` que encapsulan la lógica compleja y las interacciones con librerías externas (@thatopen, Three.js, Firebase).
4.  **Capa de Constantes y Configuración**: Definiciones estáticas en `src/constants` y `src/config` para mantener la consistencia en todo el proyecto.

### Tecnologías Principales
-   **Core**: [Next.js 15](https://nextjs.org/) & [React 19](https://react.dev/)
-   **BIM/IFC**: [@thatopen/components](https://thatopen.github.io/components/) (Sucesor de IFC.js)
-   **Gráficos 3D**: [Three.js](https://threejs.org/)
-   **Backend & Auth**: [Firebase](https://firebase.google.com/) (Firestore & Auth)
-   **Interfaz de Usuario**: [Material UI (MUI)](https://mui.com/) y [Emotion](https://emotion.sh/)
-   **Visualización de Datos**: [Chart.js](https://www.chartjs.org/)

### Flujo de Datos
1.  **Carga de Modelos**: El usuario selecciona un archivo (IFC/FRAG) -> `useFileProcessor` recibe el archivo -> `processIfcFile` o `processFragFile` convierte/carga los datos -> El modelo se añade al `FragmentsManager` y se renderiza en la escena de Three.js.
2.  **Gestión de RDI/BCF y Dashboard**: El sistema integra un **MainDashboard** centralizado con navegación lateral que permite alternar entre analítica visual (`RDIChartsPanel`) y gestión de listados (`IncidenciasPanel`). La persistencia local se basa en **IndexedDB** (`BCFDatabase` y `ProjectsIssuesDB`), con una capa de normalización en `IncidenciasPanel` que procesa snapshots (soporte para `ImageData`, Base64 y Blobs binarios). El flujo de creación de incidencias es dual: **"Obra"** abre un formulario rápido local, mientras que **"Diseño"** redirige al **Visor 3D** mediante parámetros de URL (`?tool=rdi`), activando automáticamente la pestaña RDI y el formulario en el componente `TabTools` gracias a una señal de estado persistente (`autoOpenForm`) que garantiza la apertura incluso tras limpiar la URL para permitir el cierre del panel lateral.
3.  **Estado del Visor**: La configuración de la cámara, secciones (clipping) y herramientas activas se gestionan a través de `useViewerState` y `useViewer3D`, centralizando el control del entorno 3D. El visor soporta activación dinámica de herramientas vía Query Params, permitiendo una integración profunda con el Dashboard de gestión.

---

## Diccionario de Funciones Críticas

| Función / Hook | Ubicación | Propósito Técnico |
| :--- | :--- | :--- |
| `initializeViewer` | `src/services/viewer3DService.js` | Configura el motor 3D y componentes de ThatOpen. Incluye una lógica de limpieza (`cleanupViewer`) robusta que libera planos de sección antes de la disposición de recursos para evitar errores de renderizado. |
| `processIfcFile` | `src/services/fileProcessorService.js` | Utiliza `IfcImporter` para convertir archivos IFC pesados en fragmentos indexados (`.frag`) optimizados para la web. |
| `useRDIManager` | `src/hooks/useRDIManager.js` | Gestiona el CRUD de RDIs con persistencia en IndexedDB. Implementa una capa de **normalización bidireccional** (canonical English keys ↔ legacy Spanish keys) para asegurar compatibilidad total entre ambientes. Soporta actualizaciones **"silenciosas"** (vía flag `silent`) que omiten el estado global de carga para evitar parpadeos (flickers) en la UI durante actualizaciones en segundo plano como el añadido de comentarios. |
| `useBCFTopics` | `src/hooks/useBCFTopics.js` | Implementa el estándar BCF (BIM Collaboration Format) para gestionar incidencias y comentarios. Inicializa `bcfTopicSet` con Sets vacíos por defecto (`statuses`, `types`, `labels`, `users`) para evitar que la UI dependa de la disponibilidad del componente OBC al evaluar estados de carga. |
| `useIndexedDB` | `src/utilitario/useIndexedDB.js` | Centraliza la apertura y migración de la base de datos IndexedDB (`BCFDatabase`, v2). Ejecuta `onupgradeneeded` para garantizar la existencia del store `topics`. Expone `{ db, loading, error }` con `loading` inicializado en `true` y resuelto en el bloque `finally`. |
| `analyzeModelGeometry`| `src/services/geometryAnalyzer.js` | Analiza el modelo cargado para extraer metadatos geométricos y facilitar la interacción con elementos específicos. |
| `AuthProvider` | `src/hooks/useAuth.js` | Gestiona la sesión de Firebase y las reglas de acceso. Controla el registro seguro de eventos de analítica iniciales (`app_opened`) asegurando la resolución previa del estado del usuario. |
| `mapBCFTopicToRDI` | `src/utilitario/bcfMapper.js` | Transforma temas BCF al formato RDI interno, normalizando campos (`assignedTo`, `dueDate`) e integrando la colección completa de comentarios originales. |
| `useRDIForm` | `src/hooks/useRDIForm.js` | Gestiona la creación/edición de RDIs, implementando la lógica de añadir comentarios dinámicos con firma de autor (vía `useAuth`) para el historial de incidencias. |
| `useSelection` | Custom Hook | Maneja la lógica de selección de elementos 3D, resaltado visual y recuperación de datos de propiedades IFC. |
| `useAnalytics` | `src/hooks/useAnalytics.js` | Capa de abstracción para el registro de eventos en el backend de analítica, con manejo integrado de fallbacks para identificar al usuario durante la carga inicial de la sesión. |
| `IncidenciasPanel` | `src/componentes/Dashboard/IncidenciasPanel.jsx` | Panel de gestión masiva con filtros dinámicos y **sincronización bidireccional completa**. Gestiona el guardado de objetos normalizados (mapeo de llaves legadas `titulo`, `estado`, etc.) incluso en **acciones rápidas de cambio de estado** y permite el añadido directo de comentarios desde el Drawer con firma de autoría integrada vía `useAuth`. |
| `CreateIssueTypeDialog` | `src/componentes/Dashboard/CreateIssueTypeDialog.jsx` | Selector visual de tipo de incidencia (Obra vs Diseño) que define el flujo de navegación y pre-configuración del reporte. |
| `RDIView` | `src/componentes/TabTools/RDIView.jsx` | Componente de visualización detallada de incidencias que integra un **sistema de comentarios directo** (sin modo edición) con orden cronológico descendente y formateo de fecha PPPp. |
| `TabTools` | `src/componentes/TabTools.jsx` | Contenedor principal de herramientas del visor que implementa `handleAddCommentDirect` para persistir comentarios de forma fluida y autoría basada en `useAuth`. |

---

> [!NOTE]
> Esta documentación es un punto de partida para entender la estructura del proyecto y debe actualizarse a medida que se añadan nuevos módulos críticos.
