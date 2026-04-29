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
2.  **Gestión de RDI/BCF**: Los componentes interactúan con `useRDIManager` o `useBCFTopics`. La persistencia local se basa en **IndexedDB** (`BCFDatabase`, store `topics`, versión 2), gestionada por `useIndexedDB`. La carga inicial de datos está **inlineada** dentro del `useEffect` de `useRDIManager` para eliminar problemas de stale closure. El componente `TabTools` evalúa el estado de carga con la condición `dbLoading || (db && rdiLoading)`, asegurando que la interfaz nunca quede atrapada en un estado de loading permanente cuando la base de datos está vacía o falla la inicialización. Durante la importación de BCF, el sistema detecta duplicados mediante GUIDs y realiza una **actualización dinámica (Upsert)** y normalización de datos (ej. responsables, fechas límites e hilos de comentarios multi-autor), garantizando la sincronía y trazabilidad del registro de incidencias.
3.  **Estado del Visor**: La configuración de la cámara, secciones (clipping) y herramientas activas se gestionan a través de `useViewerState` y `useViewer3D`, centralizando el control del entorno 3D.

---

## Diccionario de Funciones Críticas

| Función / Hook | Ubicación | Propósito Técnico |
| :--- | :--- | :--- |
| `initializeViewer` | `src/services/viewer3DService.js` | Configura el motor 3D y componentes de ThatOpen. Incluye una lógica de limpieza (`cleanupViewer`) robusta que libera planos de sección antes de la disposición de recursos para evitar errores de renderizado. |
| `processIfcFile` | `src/services/fileProcessorService.js` | Utiliza `IfcImporter` para convertir archivos IFC pesados en fragmentos indexados (`.frag`) optimizados para la web. |
| `useRDIManager` | `src/hooks/useRDIManager.js` | Gestiona el CRUD de RDIs con persistencia en IndexedDB. La carga inicial está inlineada en un `useEffect([db])` con flag `cancelled` y handler `transaction.onabort` como safeguards. El estado `loading` inicia en `true` y se resuelve a `false` en todos los caminos posibles (éxito, error, store inexistente, transacción abortada). Incluye una función `loadRDIsFromDB` separada vía `useCallback` para recargas manuales post-CRUD. |
| `useBCFTopics` | `src/hooks/useBCFTopics.js` | Implementa el estándar BCF (BIM Collaboration Format) para gestionar incidencias y comentarios. Inicializa `bcfTopicSet` con Sets vacíos por defecto (`statuses`, `types`, `labels`, `users`) para evitar que la UI dependa de la disponibilidad del componente OBC al evaluar estados de carga. |
| `useIndexedDB` | `src/utilitario/useIndexedDB.js` | Centraliza la apertura y migración de la base de datos IndexedDB (`BCFDatabase`, v2). Ejecuta `onupgradeneeded` para garantizar la existencia del store `topics`. Expone `{ db, loading, error }` con `loading` inicializado en `true` y resuelto en el bloque `finally`. |
| `analyzeModelGeometry`| `src/services/geometryAnalyzer.js` | Analiza el modelo cargado para extraer metadatos geométricos y facilitar la interacción con elementos específicos. |
| `AuthProvider` | `src/hooks/useAuth.js` | Gestiona la sesión de Firebase y las reglas de acceso. Controla el registro seguro de eventos de analítica iniciales (`app_opened`) asegurando la resolución previa del estado del usuario. |
| `mapBCFTopicToRDI` | `src/utilitario/bcfMapper.js` | Transforma temas BCF al formato RDI interno, normalizando campos (`assignedTo`, `dueDate`) e integrando la colección completa de comentarios originales. |
| `useRDIForm` | `src/hooks/useRDIForm.js` | Gestiona la creación/edición de RDIs, implementando la lógica de añadir comentarios dinámicos con firma de autor (vía `useAuth`) para el historial de incidencias. |
| `useSelection` | Custom Hook | Maneja la lógica de selección de elementos 3D, resaltado visual y recuperación de datos de propiedades IFC. |
| `useAnalytics` | `src/hooks/useAnalytics.js` | Capa de abstracción para el registro de eventos en el backend de analítica, con manejo integrado de fallbacks para identificar al usuario durante la carga inicial de la sesión. |

---

> [!NOTE]
> Esta documentación es un punto de partida para entender la estructura del proyecto y debe actualizarse a medida que se añadan nuevos módulos críticos.
