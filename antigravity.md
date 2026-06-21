# Documentación del Proyecto: Visor ThatOpen

## Arquitectura General

El proyecto está construido sobre el framework **Next.js 15**, utilizando una arquitectura basada en componentes con una clara separación de responsabilidades a través de capas de servicios y hooks personalizados.

### Patrón de Arquitectura
Se sigue un patrón de **Arquitectura de Componentes con Capas de Servicio y Repositorio**:
1.  **Capa de Componentes (UI)**: React Components (usando Material UI) que se encargan de la presentación y la interacción directa con el usuario.
2.  **Capa de Hooks (Lógica de Estado)**: Hooks personalizados en `src/hooks` que gestionan el estado local/global y actúan como puente entre la UI y los servicios.
3.  **Capa de Servicios (Lógica de Dominio)**: Módulos en `src/services` que encapsulan la lógica compleja y las interacciones con librerías externas (@thatopen, Three.js, Firebase).
4.  **Capa de Repositorio (Abstracción de Datos)**: Clases en `src/repositories` (e.g. `IndexedDBProgressRepository`) que implementan contratos de almacenamiento para separar la lógica de negocio de la base de datos.
5.  **Capa de Constantes y Configuración**: Definiciones estáticas en `src/constants` y `src/config` para mantener la consistencia en todo el proyecto.

### Tecnologías Principales
-   **Core**: [Next.js 15](https://nextjs.org/) & [React 19](https://react.dev/)
-   **BIM/IFC**: [@thatopen/components](https://thatopen.github.io/components/) (Sucesor de IFC.js)
-   **Gráficos 3D**: [Three.js](https://threejs.org/)
-   **Backend & Auth**: [Firebase](https://firebase.google.com/) (Firestore & Auth)
-   **Interfaz de Usuario**: [Material UI (MUI)](https://mui.com/) y [Emotion](https://emotion.sh/)
-   **Visualización de Datos**: [Chart.js](https://www.chartjs.org/)
-   **Almacenamiento Local**: IndexedDB para persistencia persistente offline.

### Flujo de Datos
1.  **Carga de Modelos**: El usuario selecciona un archivo (IFC/FRAG) -> `useFileProcessor` recibe el archivo -> `processIfcFile` o `processFragFile` convierte/carga los datos -> El modelo se añade al `FragmentsManager` y se renderiza en la escena de Three.js.
2.  **Gestión de RDI/BCF y Dashboard**: El sistema integra un **MainDashboard** centralizado con navegación lateral que permite alternar entre analítica visual (`RDIChartsPanel`) y gestión de listados (`IncidenciasPanel`). La persistencia local se basa en **IndexedDB** (`BCFDatabase` y `ProjectsIssuesDB`), con una capa de normalización en `IncidenciasPanel` que procesa snapshots (soporte para `ImageData`, Base64 y Blobs binarios). El flujo de creación de incidencias es dual: **"Obra"** abre un formulario rápido local, mientras que **"Diseño"** redirige al **Visor 3D** mediante parámetros de URL (`?tool=rdi`), activando automáticamente la pestaña RDI y el formulario en el componente `TabTools` gracias a una señal de estado persistente (`autoOpenForm`) que garantiza la apertura incluso tras limpiar la URL para permitir el cierre del panel lateral.
3.  **Estado del Visor**: La configuración de la cámara, secciones (clipping) y herramientas activas se gestionan a través de `useViewerState` y `useViewer3D`, centralizando el control del entorno 3D. El visor soporta activación dinámica de herramientas vía Query Params, permitiendo una integración profunda con el Dashboard de gestión.
4.  **[Feature: Avance en Obra] Flujo de Gestión de Avance**: 
    - **Registro de Mapeos**: Durante la carga del IFC mediante `processIfcFile`, se usa `IfcLoader` con atributos únicos habilitados para generar un mapa bidireccional en `GuidMapService` (GUID ↔ {modelId, instanceId (ExpressID)}).
    - **Selección e Identificación**: Al seleccionar un elemento en el visor 3D, `usePropertySelection` obtiene su GlobalId (GUID) y lo asocia a un grupo de avance.
    - **Persistencia**: `useProgressManager` delega el almacenamiento en `IndexedDBProgressRepository` (que implementa `IProgressRepository`), guardando la información de grupos (soportando jerarquía de árbol mediante `parentId`, pesos y avances programados), elementos (por GUID), hitos de avance (snapshots) y capturas fotográficas (almacenadas óptimamente como Blobs binarios para evitar el overhead de Base64) en la base de datos `ProgressDB`.
    - **Cálculo de Progreso**: La lógica de negocio realiza cálculos avanzados ponderados (porcentaje, costo, horas hombre, volumen) y cálculo de cumplimiento (real vs planificado) propagando el progreso de manera ascendente en el árbol.
    - **Visualización BIM**: El estado de avance se mapea visualmente sobre la geometría 3D aplicando colores específicos por rangos de avance directos a nivel de instancia del fragmento via `setColor` para mantener el rendimiento.
5.  **[Feature: Metadatos BIM y Sincronización]**: Gestión de metadatos del elemento 3D seleccionado y sincronización entre versiones IFC. Al cambiar el elemento seleccionado, el hook `useVersionSync` y el servicio `MetadataService` facilitan la visualización unificada en `ElementDashboard` a través de IndexedDB (con soporte preparado para Firestore en producción).

---

## Diccionario de Funciones Críticas

| Función / Hook | Ubicación | Propósito Técnico |
| :--- | :--- | :--- |
| `initializeViewer` | `src/services/viewer3DService.js` | Configura el motor 3D y componentes de ThatOpen. Incluye una lógica de limpieza (`cleanupViewer`) robusta que libera planos de sección antes de la disposición de recursos para evitar errores de renderizado. |
| `processIfcFile` | `src/services/fileProcessorService.js` | Utiliza `IfcLoader` de `@thatopen/components` para cargar el archivo IFC, habilitando atributos y relaciones únicos para construir el mapa de GUIDs de forma asíncrona. |
| `useRDIManager` | `src/hooks/useRDIManager.js` | Gestiona el CRUD de RDIs con persistencia en IndexedDB. Implementa una capa de **normalización bidireccional** (canonical English keys ↔ legacy Spanish keys) para asegurar compatibilidad total entre ambientes. Soporta actualizaciones **"silenciosas"** (vía flag `silent`) que omiten el estado global de carga para evitar parpadeos (flickers) en la UI durante actualizaciones en segundo plano como el añadido de comentarios. |
| `useBCFTopics` | `src/hooks/useBCFTopics.js` | Implementa el estándar BCF (BIM Collaboration Format) para gestionar incidencias y comentarios. Inicializa `bcfTopicSet` con Sets vacíos por defecto (`statuses`, `types`, `labels`, `users`) para evitar que la UI dependa de la disponibilidad del componente OBC al evaluar estados de carga. |
| `useIndexedDB` | `src/utilitario/useIndexedDB.js` | Centraliza la apertura y migración de la base de datos IndexedDB (`BCFDatabase`, v2). Ejecuta `onupgradeneeded` para garantizar la existencia del store `topics`. Expone `{ db, loading, error }` con `loading` inicializado en `true` and resuelto en el bloque `finally`. |
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
| `usePropertySelection` | `src/hooks/usePropertySelection.js` | Gestiona la selección y recuperación de metadatos/Psets del elemento IFC, extrayendo el `selectedGuid` (GlobalId) y mapeándolo en `GuidMapService`. |
| `[Feature] useProgressManager` | `src/hooks/useProgressManager.js` | Hook que orquesta la lógica de negocio y las llamadas al repositorio para gestionar grupos de avance, snapshots e imágenes. Soporta jerarquía en árbol, cálculo de progreso ponderado, cumplimiento de metas y KPIs de proyecto. |
| `[Feature] IndexedDBProgressRepository` | `src/repositories/IndexedDBProgressRepository.js` | Implementación de `IProgressRepository` que interactúa con `ProgressDB` para almacenar y consultar grupos (con soporte de parentId), elementos, snapshots e imágenes. |
| `[Feature] IProgressRepository` | `src/repositories/interfaces/IProgressRepository.js` | Interfaz (contrato) que define los métodos que cualquier repositorio de avance de obra (IndexedDB, Firebase) debe implementar. Incluye el contrato base (grupos, elementos, snapshots, fotos), métodos de jerarquía (`getChildGroups`, `getRootGroups`, `getGroupTree`, `getGroupsByParent`) y métodos de integración con el dominio `production` del schema unificado de `metadataStandards.js` (`getProductionDataForGlobalId`, `updateProductionDataFromMetadata`). |
| `[Feature] ProgressDB` | `src/database/ProgressDB.js` | Configura e inicializa la base de datos IndexedDB dedicada `ProgressDB` (versión 2) y sus almacenes (`objectStores`). El store `ProgressGroups` tiene dos índices: `name` (único: false) y `parentId` (único: false) para consultas jerárquicas. El handler `onupgradeneeded` ejecuta una migración explícita: si `oldVersion < 2`, crea el índice `parentId` en el store existente sin destruir datos previos. |
| `[Feature] GuidMapService` | `src/services/guidMapService.js` | Servicio singleton que almacena el mapa bidireccional en memoria entre GlobalId (GUID) y coordenadas `modelId:instanceId`. |
| `[Feature] ProgressPanel` | `src/componentes/Progress/` | Panel y subcomponentes (`ProgressGroupList`, `ProgressGroupDetail`, `ProgressGroupForm`, `PhotoCapture`, `SnapshotForm`, `SnapshotHistoryPanel`) para la gestión del avance físico de obra, toma de fotos (Blobs) y visualización. |
| `[Feature] useBIMColors` | `src/hooks/useBIMColors.js` | Hook para aplicar de forma interactiva y con alto rendimiento los colores de avance físico (BIM) a las instancias de los elementos 3D del visor utilizando estilos de highlighter personalizados. |
| `[Feature] useProgressPhotos` | `src/hooks/useProgressPhotos.js` | Hook que encapsula el CRUD de fotografías vinculadas a hitos/snapshots de avance, gestionando la optimización de imágenes (redimensionamiento en Canvas) y la liberación de Object URLs para evitar fugas de memoria. |
| `[Feature] useProgressSnapshots` | `src/hooks/useProgressSnapshots.js` | Hook para gestionar el historial de hitos de avance (snapshots) de un grupo de obra y disparar la actualización de progreso correspondiente. |
| `[Feature] progressCalculator` | `src/services/progressCalculator.js` | Módulo de servicio con funciones puras para el cálculo de progreso. Exporta: `calculateWeightedProgress` (promedio ponderado por `weight`), `calculateCompliance` (% cumplimiento real vs planificado), `calculateChildrenProgress` (agrega hijos de un `parentId`), `buildGroupTree` (construye árbol y propaga progreso ascendentemente), `calculateProjectKPIs` (KPIs agregados del proyecto con rangeCounts, compliance y criticalCount, acepta `targetDate`), `interpolatePlannedProgress` (interpolación lineal de la curva `plannedCurve` para una fecha dada), `getEffectivePlannedProgress` (devuelve el progreso planificado efectivo: usa la curva si existe, si no cae en `plannedProgress`), y `buildCurveDatasets` (construye los datasets de planned vs actual para la curva S, soportando vista por grupo hoja, grupo padre o proyecto completo). |
| `[Feature] MetadataService` | `src/services/metadataService.js` | Servicio que centraliza la lectura y escritura de metadatos BIM asociados a un GlobalId (GUID) bajo un esquema unificado, administrando colas de sincronización para soporte offline/online. |
| `[Feature] useVersionSync` | `src/hooks/useVersionSync.js` | Hook para ejecutar la sincronización de versiones del IFC, actualizando el estado de la UI y los metadatos sincronizados mediante `MetadataService`. |
| `[Feature] ElementDashboard` | `src/componentes/ElementDashboard.jsx` | Ficha técnica unificada y modular que presenta metadatos (generales, avance, presupuesto, incidencias, fotos) de un elemento seleccionado por su GUID. |
| `[Feature] VersionSyncPanel` | `src/componentes/VersionSyncPanel.jsx` | Panel de control en la UI del visor para visualizar el estado, fecha de sincronización e iniciar el proceso de actualización de versiones IFC. |
| `[Feature] IndexedDBMetadataRepository` | `src/repositories/IndexedDBMetadataRepository.js` | Repositorio de IndexedDB (`MetadataDB`) encargado de persistir los metadatos unificados por GlobalId y proveer consultas rápidas de clasificación y dominios. |

---

> [!NOTE]
> Esta documentación es un punto de partida para entender la estructura del proyecto y debe actualizarse a medida que se añadan nuevos módulos críticos.

