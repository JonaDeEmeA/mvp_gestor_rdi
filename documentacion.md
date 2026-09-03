# Documentación del Proyecto: Visor ThatOpen

> Documento consolidado de arquitectura, diseño y módulos del proyecto.
> Referencia externa: [EsquemaPaneles.drawio](./EsquemaPaneles.drawio) (diagrama de paneles de UI).

---

## 1. Arquitectura General

El proyecto está construido sobre el framework **Next.js 15**, utilizando una arquitectura basada en componentes con una clara separación de responsabilidades a través de capas de servicios y hooks personalizados.

### Patrón de Arquitectura

Se sigue un patrón de **Arquitectura de Componentes con Capas de Servicio y Repositorio**:

1. **Capa de Componentes (UI)** — Componentes React (Material UI) responsables de la presentación e interacción con el usuario.
2. **Capa de Hooks (Lógica de Estado)** — Hooks personalizados en `src/hooks` que gestionan el estado y actúan de puente entre UI y servicios.
3. **Capa de Servicios (Lógica de Dominio)** — Módulos en `src/services` que encapsulan la lógica compleja y las interacciones con librerías externas (`@thatopen`, Three.js, Firebase).
4. **Capa de Repositorio (Abstracción de Datos)** — Clases en `src/repositories` (p. ej. `IndexedDBProgressRepository`, `IndexedDBMetadataRepository`) que separan la lógica de negocio de la base de datos.
5. **Capa de Constantes y Configuración** — Definiciones estáticas en `src/constants` y `src/config` para mantener consistencia en todo el proyecto.

### Tecnologías Principales

- **Core**: [Next.js 15](https://nextjs.org/) & [React 19](https://react.dev/)
- **BIM/IFC**: [@thatopen/components](https://thatopen.github.io/components/) (sucesor de IFC.js)
- **Gráficos 3D**: [Three.js](https://threejs.org/)
- **Backend & Auth**: [Firebase](https://firebase.google.com/) (Firestore & Auth)
- **UI**: [Material UI (MUI)](https://mui.com/) y Emotion
- **Visualización de Datos**: [Chart.js](https://www.chartjs.org/)
- **Almacenamiento Local**: IndexedDB para persistencia offline

### Flujo de Datos

1. **Carga de Modelos**: el usuario selecciona un archivo (IFC/FRAG) → `useFileProcessor` lo recibe → `processIfcFile` o `processFragFile` convierten/cargan los datos → el modelo se añade al `FragmentsManager` y se renderiza en la escena Three.js.
2. **Gestión de RDI/BCF y Dashboard**: el sistema integra un **MainDashboard** centralizado con navegación lateral para alternar entre analítica visual (`RDIChartsPanel`) y gestión de listados (`IncidenciasPanel`). La persistencia local se basa en **IndexedDB**, con una capa de normalización que procesa snapshots (soporte para `ImageData`, Base64 y Blobs). El flujo de creación de incidencias es dual: **"Obra"** abre un formulario rápido local, mientras que **"Diseño"** redirige al **Visor 3D** mediante parámetros de URL (`?tool=rdi`), activando automáticamente la pestaña RDI y el formulario en `TabTools` mediante una señal de estado persistente (`autoOpenForm`).
3. **Estado del Visor**: la configuración de cámara, secciones (clipping) y herramientas activas se gestionan a través de `useViewerState` y `useViewer3D`. El visor soporta activación dinámica de herramientas vía Query Params, permitiendo integración profunda con el Dashboard.
4. **[Avance en Obra]**: ver sección 4.
5. **[Metadatos BIM y Sincronización]**: al cambiar el elemento seleccionado, `useVersionSync` y `MetadataService` facilitan la visualización unificada en `ElementDashboard` a través de IndexedDB (con soporte preparado para Firestore en producción).

---

## 2. Diccionario de Funciones Críticas

| Función / Hook | Ubicación | Propósito Técnico |
| :--- | :--- | :--- |
| `initializeViewer` | `src/services/viewer3DService.js` | Configura el motor 3D y componentes de ThatOpen. Incluye lógica de limpieza (`cleanupViewer`) que libera planos de sección antes de disponer recursos para evitar errores de renderizado. |
| `processIfcFile` | `src/services/fileProcessorService.js` | Usa `IfcLoader` de `@thatopen/components` para cargar el IFC, habilitando atributos y relaciones únicos para construir el mapa de GUIDs de forma asíncrona. |
| `useRDIManager` | `src/hooks/useRDIManager.js` | CRUD de RDIs con persistencia en IndexedDB. Implementa **normalización bidireccional** (keys canónicos inglés ↔ keys legados español). Soporta actualizaciones "silenciosas" (flag `silent`) que omiten el estado global de carga para evitar flickers en la UI. |
| `useBCFTopics` | `src/hooks/useBCFTopics.js` | Implementa el estándar BCF para gestionar incidencias y comentarios. Inicializa `bcfTopicSet` con Sets vacíos por defecto (`statuses`, `types`, `labels`, `users`) para que la UI no dependa de la disponibilidad del componente OBC. |
| `useIndexedDB` | `src/utilitario/useIndexedDB.js` | Centraliza la apertura y migración de la base IndexedDB (`BCFDatabase`, v2). Expone `{ db, loading, error }`. |
| `analyzeModelGeometry` | `src/services/geometryAnalyzer.js` | Analiza el modelo cargado para extraer metadatos geométricos y facilitar la interacción con elementos específicos. |
| `AuthProvider` | `src/hooks/useAuth.js` | Gestiona la sesión de Firebase y las reglas de acceso. Controla el registro seguro de eventos de analítica iniciales (`app_opened`). |
| `mapBCFTopicToRDI` | `src/utilitario/bcfMapper.js` | Transforma temas BCF al formato RDI interno, normalizando campos (`assignedTo`, `dueDate`) e integrando la colección de comentarios originales. |
| `useRDIForm` | `src/hooks/useRDIForm.js` | Gestiona la creación/edición de RDIs, incluyendo comentarios dinámicos con firma de autor (vía `useAuth`). |
| `useAnalytics` | `src/hooks/useAnalytics.js` | Abstracción para el registro de eventos de analítica con fallbacks para identificar al usuario durante la carga inicial. |
| `IncidenciasPanel` | `src/componentes/Dashboard/IncidenciasPanel.jsx` | Panel de gestión masiva con filtros dinámicos y **sincronización bidireccional completa**, incluyendo acciones rápidas de cambio de estado y comentarios con autoría vía `useAuth`. |
| `CreateIssueTypeDialog` | `src/componentes/Dashboard/CreateIssueTypeDialog.jsx` | Selector de tipo de incidencia (Obra vs Diseño) que define el flujo de navegación y pre-configuración del reporte. |
| `RDIView` | `src/componentes/TabTools/RDIView.jsx` | Visualización detallada de incidencias con sistema de comentarios directo (sin modo edición) en orden cronológico descendente. |
| `TabTools` | `src/componentes/TabTools.jsx` | Contenedor principal de herramientas del visor; implementa `handleAddCommentDirect` para persistir comentarios con autoría basada en `useAuth`. |
| `usePropertySelection` | `src/hooks/usePropertySelection.js` | Gestión de selección y recuperación de metadatos/Psets del elemento IFC, extrayendo el `selectedGuid` (GlobalId) y mapeándolo en `GuidMapService`. |
| `useProgressManager` | `src/hooks/useProgressManager.js` | Hook que orquesta la lógica de negocio y las llamadas al repositorio para gestionar grupos de avance, snapshots e imágenes. Soporta jerarquía en árbol, cálculo de progreso ponderado, cumplimiento y KPIs. |
| `IndexedDBProgressRepository` | `src/repositories/IndexedDBProgressRepository.js` | Implementación del repositorio de avance de obra que interactúa con `ProgressDB` para almacenar y consultar grupos (con soporte de `parentId`), elementos, snapshots e imágenes. |
| `ProgressDB` | `src/database/ProgressDB.js` | Configura e inicializa la base IndexedDB `ProgressDB` (versión 2) y sus almacenes. `ProgressGroups` tiene índices `name` y `parentId`. La migración `oldVersion < 2` crea el índice `parentId` sin destruir datos previos. |
| `GuidMapService` | `src/services/guidMapService.js` | Servicio singleton que almacena el mapa bidireccional en memoria entre GlobalId (GUID) y `modelId:instanceId`. |
| `ProgressPanel` | `src/componentes/Progress/` | Panel y subcomponentes (`ProgressGroupList`, `ProgressGroupDetail`, `ProgressGroupForm`, `PhotoCapture`, `SnapshotForm`, `SnapshotHistoryPanel`) para la gestión del avance físico de obra, fotos (Blobs) y visualización. |
| `useBIMColors` | `src/hooks/useBIMColors.js` | Aplica de forma interactiva y con alto rendimiento los colores de avance físico a las instancias de los elementos 3D usando estilos de highlighter personalizados. |
| `useProgressPhotos` | `src/hooks/useProgressPhotos.js` | CRUD de fotografías vinculadas a hitos/snapshots, con optimización de imágenes (redimensionado en Canvas) y liberación de Object URLs para evitar fugas de memoria. |
| `useProgressSnapshots` | `src/hooks/useProgressSnapshots.js` | Gestión del historial de hitos de avance (snapshots) de un grupo y disparo de la actualización de progreso correspondiente. |
| `progressCalculator` | `src/services/progressCalculator.js` | Funciones puras de cálculo de progreso (ver sección 4). |
| `MetadataService` | `src/services/metadataService.js` | Centraliza la lectura y escritura de metadatos BIM asociados a un GlobalId bajo un esquema unificado, con colas de sincronización para soporte offline/online. |
| `useVersionSync` | `src/hooks/useVersionSync.js` | Ejecuta la sincronización de versiones del IFC, actualizando el estado de la UI y los metadatos mediante `MetadataService`. |
| `ElementDashboard` | `src/componentes/ElementDashboard.jsx` | Ficha técnica unificada y modular con metadatos (generales, avance, presupuesto, incidencias, fotos) de un elemento seleccionado por su GUID. |
| `VersionSyncPanel` | `src/componentes/VersionSyncPanel.jsx` | Panel de control del visor para visualizar estado/fecha de sincronización e iniciar la actualización de versiones IFC. |
| `IndexedDBMetadataRepository` | `src/repositories/IndexedDBMetadataRepository.js` | Repositorio de IndexedDB (`MetadataDB`) que persiste los metadatos unificados por GlobalId y provee consultas de clasificación y dominios. |

---

## 3. Arquitectura del Repositorio de Metadatos BIM

### Principio Fundamental

El archivo IFC **NO es la base de datos del proyecto**. Representa únicamente el estado geométrico en un momento determinado. Toda la información generada por los usuarios se almacena en un repositorio independiente:

> El modelo IFC representa la **geometría** del proyecto.
> El repositorio de metadatos representa el **conocimiento** acumulado sobre ese proyecto.

### El Modelo IFC como Fuente de Geometría

El IFC se usa únicamente para obtener: geometría, relaciones espaciales, propiedades originales, clasificación IFC y GlobalId.

No debe usarse para almacenar: avance, incidencias, fotografías, comentarios, costos, responsables, planificación o documentos. Esa información pertenece al proyecto, no al archivo.

### Repositorio de Metadatos BIM

El núcleo de la plataforma es un **Repositorio de Metadatos BIM**: la fuente única de verdad para la información generada durante el proyecto. Cada elemento se identifica por su **GlobalId**, que actúa como llave principal:

```text
Proyecto
      │
      ▼
Repositorio de Metadatos BIM
      │
      ▼
GlobalId
      │
      ├── Clasificación
      ├── Capítulo / Subcapítulo
      ├── Peso / Unidad / Cantidad
      ├── Responsable / Ruta crítica
      ├── Avance / Incidencias
      ├── Fotografías / Comentarios
      ├── Documentos / Historial
      └── KPIs
```

### El IFC como Cliente del Repositorio

Cada vez que se abre un modelo: se carga el IFC → se leen los GlobalId → se consulta el repositorio → se enriquecen visualmente los elementos. El modelo actúa únicamente como interfaz gráfica.

### Beneficios

- **Persistencia**: los datos sobreviven aunque el modelo IFC cambie.
- **Independencia del software BIM**: la plataforma no depende de Revit, Archicad, Tekla, etc.
- **Reutilización**: un mismo dato (p. ej. peso económico) lo consumen Avance, Reportes, KPIs y Curvas S sin duplicarse.
- **Escalabilidad**: nuevos módulos (Calidad, Seguridad, Planificación, etc.) reutilizan el mismo repositorio.

### Información del Repositorio

- **Clasificación**: capítulo, subcapítulo, especialidad, disciplina.
- **Contractual**: responsable, empresa, contrato, ruta crítica.
- **Producción**: grupo de avance, peso, unidad, cantidad, avance.
- **Económica**: costo, presupuesto, horas hombre, peso económico.
- **Gestión**: incidencias, observaciones, fotografías, documentos, historial.
- **Analítica**: KPIs, indicadores, curvas, snapshots.

### Sincronización de Nuevas Versiones IFC

Al importar una nueva versión, **NO se reemplaza el repositorio**; se ejecuta un proceso de sincronización:

1. Leer todos los GlobalId del nuevo modelo.
2. Compararlos con los almacenados.
3. Clasificarlos en tres grupos:

- **Elementos Conservados**: el GlobalId existe en ambos → se mantiene toda la información.
- **Elementos Nuevos**: solo en el IFC → se crean registros sin metadatos.
- **Elementos Eliminados**: solo en el repositorio → **no se eliminan**; se marcan como obsoletos para conservar historial, fotografías, incidencias y auditoría.

**Si cambia la geometría** pero el GlobalId permanece igual, se considera el mismo elemento y el conocimiento asociado permanece intacto.

**Si el modelador elimina un elemento y crea uno nuevo** (mismo nombre, distinto GlobalId), IFC los trata como elementos distintos: se registra uno eliminado y otro nuevo. La reconciliación manual/semiautomática queda fuera del alcance del MVP.

### Los Módulos no son Dueños de la Información

Cada módulo solo consume o amplía el repositorio. Por ejemplo:

- **Incidencias**: consulta elementos/responsables; escribe incidencias, fotografías, comentarios.
- **Avance**: consulta elementos/pesos/clasificación; escribe snapshots, porcentajes, evidencias.
- **Reportes**: solo consulta; no genera información propia.
- **KPIs**: consulta snapshots/pesos/planificación; calcula indicadores, gráficos y curvas.

### El Modelo BIM como Interfaz Principal

El flujo de trabajo se construye alrededor del modelo. Desde un elemento IFC el usuario debe poder consultar incidencias, registrar avances, visualizar fotografías, revisar historial, acceder a documentos y consultar indicadores, todo convergiendo sobre el GlobalId.

### Conclusión

La decisión arquitectónica más importante es separar completamente el **modelo geométrico** del **conocimiento generado durante la ejecución**. El activo real de la plataforma es el **Repositorio de Metadatos BIM**, que conserva de forma persistente toda la información por GlobalId, permitiendo soportar nuevas versiones, evolucionar con nuevos módulos y mantener trazabilidad sin depender de una versión específica del IFC.

---

## 4. Módulo de Avance de Obra

### 4.1 Arquitectura del Módulo (Capas y Responsabilidades)

```
┌──────────────────────────────────────────────────────────────┐
│                UI LAYER (Componentes React)                   │
│  ProgressPanel │ ProgressGroupList │ ProgressGroupDetail      │
│  ProgressGroupForm │ SnapshotForm │ SnapshotHistoryPanel      │
│  PhotoCapture │ ProgressDashboard │ ProgressCurveChart        │
└──────────────────────┬───────────────────────────────────────┘
                       │ props + callbacks
┌──────────────────────▼───────────────────────────────────────┐
│               HOOKS LAYER (Lógica de Negocio)                 │
│  useProgressManager │ useProgressSnapshots │ useProgressPhotos │
│  useBIMColors                                                 │
└──────────────────────┬───────────────────────────────────────┘
                       │ interfaz del repositorio
┌──────────────────────▼───────────────────────────────────────┐
│                 REPOSITORY LAYER                              │
│  IndexedDBProgressRepository (impl. actual)                   │
│  (FirebaseProgressRepository = migración futura)              │
└──────────────────────┬───────────────────────────────────────┘
                       │ IndexedDB API
┌──────────────────────▼───────────────────────────────────────┐
│                  STORAGE LAYER (IndexedDB)                    │
│  db = ProgressDB (v2)                                         │
│  ObjectStores: ProgressGroups, GroupElements,                 │
│               ProgressSnapshots, SnapshotPhotos               │
└───────────────────────────────────────────────────────────────┘
```

**Principios:**

- Los componentes React nunca acceden a IndexedDB directamente.
- Los hooks orquestan la lógica de negocio y llaman a los repositorios.
- Los repositorios implementan una interfaz intercambiable (IndexedDB hoy, Firebase mañana).
- La capa de storage maneja solo operaciones crudas de base de datos.

### 4.2 Modelo de Dominio

```js
// ProgressGroup
{
  id: string,
  name: string,
  description: string,
  progress: number,          // 0-100 (round2)
  weight: number,            // default 1.0
  weightUnit: string,        // 'porcentaje' | 'costo' | 'horasHombre' | 'volumen' | 'personalizado'
  plannedProgress: number,   // 0-100
  plannedCurve: Array,       // [{ date, planned }] para Curva S
  isCritical: boolean,       // marca ruta crítica / atraso crítico
  parentId: string | null,   // jerarquía en árbol
  createdAt: string,
  updatedAt: string,
  createdBy: string,
}

// GroupElement
{
  id: string,
  groupId: string,           // FK -> ProgressGroup.id
  ifcGuid: string,           // IFC GlobalId (nunca ExpressID)
  elementType: string,
}

// ProgressSnapshot
{
  id: string,
  groupId: string,           // FK -> ProgressGroup.id
  progress: number,          // 0-100
  comment: string,
  createdAt: string,
  createdBy: string,
}

// SnapshotPhoto
{
  id: string,
  snapshotId: string,        // FK -> ProgressSnapshot.id
  imageData: Blob,           // almacenado como Blob, no Base64
  caption: string,
  createdAt: string,
}
```

### 4.3 Modelo de Datos IndexedDB

Base de datos única: `ProgressDB` (versión 2). Se crea una base separada de `BCFDatabase` para mantener el desacoplamiento y no contaminar el esquema existente.

| ObjectStore | keyPath | Índices |
| --- | --- | --- |
| `ProgressGroups` | `id` | `name`, `parentId` |
| `GroupElements` | `id` | `groupId`, `ifcGuid` |
| `ProgressSnapshots` | `id` | `groupId`, `createdAt` |
| `SnapshotPhotos` | `id` | `snapshotId` |

**Migración**: en `onupgradeneeded`, si `oldVersion < 2`, se crea el índice `parentId` en `ProgressGroups` sin destruir datos previos.

### 4.4 Repositorio (`IndexedDBProgressRepository`)

Métodos implementados en `src/repositories/IndexedDBProgressRepository.js`:

**Grupos**
- `getGroups()`, `getGroupById(id)`
- `createGroup(data)`, `updateGroup(id, data)`, `deleteGroup(id)` *(elimina en cascada sus elementos)*
- `getRootGroups()`, `getChildGroups(parentId)`, `getGroupsByParent(parentId)`, `getGroupTree()`

**Elementos**
- `getElementsByGroup(groupId)`, `addElementToGroup(groupId, ifcGuid, elementType)`, `removeElementFromGroup(groupId, ifcGuid)`, `getGroupsByElement(ifcGuid)`

**Snapshots**
- `getSnapshotsByGroup(groupId)`, `getLatestSnapshotByGroup(groupId)`, `createSnapshot(data)`

**Fotos**
- `getPhotosBySnapshot(snapshotId)`, `addPhoto(data)`, `deletePhoto(photoId)`

**Migración futura a Firebase**: se crearía `FirebaseProgressRepository` implementando la misma interfaz. El cambio sería solo en la inyección del repositorio, sin tocar componentes ni lógica de negocio.

### 4.5 Cálculo de Progreso (`progressCalculator`)

Módulo de funciones puras en `src/services/progressCalculator.js`:

- `calculateWeightedProgress(groups)` — promedio ponderado por `weight`.
- `calculateCompliance(realProgress, plannedProgress)` — % de cumplimiento (real vs planificado).
- `calculateChildrenProgress(groups, parentId, targetDate)` — agrega los hijos de un `parentId`.
- `buildGroupTree(groups)` — construye el árbol y propaga el progreso ascendentemente.
- `interpolatePlannedProgress(curve, targetDate)` — interpolación lineal de la curva planificada.
- `getEffectivePlannedProgress(group, targetDate)` — progreso planificado efectivo (curva si existe, si no `plannedProgress`).
- `buildCurveDatasets(groups, snapshotsByGroup, selectedGroupId)` — datasets planned vs actual para la Curva S (grupo hoja, grupo padre o proyecto completo).
- `calculateProjectKPIs(groups, targetDate)` — KPIs agregados: `weightedProgress`, `compliance`, `criticalCount`, `coveredGroups`, `rangeCounts`.

**Unidades de peso** (`src/constants/progressStandards.js`): `porcentaje`, `costo`, `horasHombre`, `volumen`, `personalizado`. Peso por defecto `1.0`, precisión de 2 decimales.

### 4.6 Almacenamiento de Fotografías

| Estrategia | Almacenamiento | Rendimiento | Migración futura | MVP |
| --- | --- | --- | --- | --- |
| Base64 | ~33% más grande | Codificación costosa en cada carga | Fácil (string portable) | ❌ |
| **Blob** | Binario nativo, sin overhead | Óptimo; IndexedDB lo soporta nativamente | Blob → Firebase Storage | ✅ |
| Object URLs | Solo referencia en memoria | Muy rápido para visualización | No persistente | ❌ (solo visualización) |

**Decisión**: Blob + Object URL para visualización. Para mostrar la imagen se usa `URL.createObjectURL(blob)` y se revoca al desmontar (evita memory leaks).

**Límites MVP** (`PROGRESS_LIMITS`): máx. 5 fotos por snapshot; imágenes redimensionadas a 1200 px en el lado mayor.

### 4.7 Visualización BIM (Color por Avance)

| Rango de Avance | Color | Código |
| --- | --- | --- |
| 0% | Gris neutro | `#888888` |
| 1% – 49% | Amarillo | `#FFC107` |
| 50% – 99% | Azul | `#2196F3` |
| 100% | Verde | `#4CAF50` |

**Implementación**: se usa `fragment.setColor([r, g, b], instanceId)` a nivel de instancia del fragmento (no se crea un material por elemento, no se usa `highlightByID`). Se mantiene un mapa `guid → { modelId, instanceId }` calculado al cargar el modelo (`GuidMapService`). Los cambios de color se aplican en lote y se resuelven por GlobalId en cada carga, de modo que los ExpressID puedan cambiar sin perder la correspondencia.

### 4.8 Compatibilidad con Nuevas Versiones IFC

- Al cargar el IFC se construye un mapa bidireccional `GlobalId → { modelId, instanceId }`.
- Los grupos de avance almacenan solo GlobalIds.
- GlobalIds nuevos → elementos agregados (aparecen en gris).
- GlobalIds faltantes → elementos eliminados (se conservan en BD, se marcan como "no encontrados").
- ExpressID distinto tras recarga → no afecta, todo se resuelve por GlobalId.

### 4.9 Riesgos

| # | Riesgo | Mitigación |
| --- | --- | --- |
| R1 | Degradación de rendimiento con muchos elementos coloreados | `setColor()` por instancia de fragmento, no `highlightByID` |
| R2 | Fotografías grandes saturan IndexedDB | Redimensionar a 1200 px, límite de 5 fotos/snapshot |
| R3 | Blobs en IndexedDB pueden exceder cuota | Monitorear `navigator.storage.estimate()` |
| R4 | GlobalId no extraído del IFC | Extracción en carga vía `usePropertySelection` + `GuidMapService` |
| R5 | Repositorio sin enforcement de tipos (JS) | JSDoc + convención; migración a TS posterior |
| R6 | Object URLs no liberadas (memory leaks) | Limpieza en `useEffect` return |
| F1 | Usuario sin conexión | IndexedDB offline-first |
| F2 | Confusión ExpressID vs GlobalId | Validación en repositorio + documentación |
| F3 | Avance 100% sin obra terminada | Historial permite revertir |
| F4 | Fotos sin modelo de referencia | Guardar viewpoint asociado a la foto |
| F5 | Múltiples usuarios sin sincronización | Postergado para migración Firebase |

---

> **Nota**: este documento debe actualizarse a medida que se añadan nuevos módulos críticos.
