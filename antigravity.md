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
2.  **Gestión de RDI/BCF**: Los componentes interactúan con `useRDIManager` o `useBCFTopics` -> Estos hooks mantienen el estado en sincronía con **Firebase Firestore** para persistencia colaborativa en tiempo real.
3.  **Estado del Visor**: La configuración de la cámara, secciones (clipping) y herramientas activas se gestionan a través de `useViewerState` y `useViewer3D`, centralizando el control del entorno 3D.

---

## Diccionario de Funciones Críticas

| Función / Hook | Ubicación | Propósito Técnico |
| :--- | :--- | :--- |
| `initializeViewer` | `src/services/viewer3DService.js` | Configura el motor 3D, inicializa el mundo de ThatOpen, la cámara ortoperspectiva, el renderizador y el `FragmentsManager`. |
| `processIfcFile` | `src/services/fileProcessorService.js` | Utiliza `IfcImporter` para convertir archivos IFC pesados en fragmentos indexados (`.frag`) optimizados para la web. |
| `useRDIManager` | `src/hooks/useRDIManager.js` | Gestiona el CRUD de Solicitudes de Información (RDI), incluyendo la lógica de estados, visualización de puntos de vista y sincronía con Firestore. |
| `useBCFTopics` | `src/hooks/useBCFTopics.js` | Implementa el estándar BCF (BIM Collaboration Format) para gestionar incidencias y comentarios vinculados a elementos específicos del modelo. |
| `analyzeModelGeometry`| `src/services/geometryAnalyzer.js` | Analiza el modelo cargado para extraer metadatos geométricos y facilitar la interacción con elementos específicos. |
| `AuthProvider` | `src/hooks/useAuth.js` | Proveedor de contexto que envuelve la aplicación para gestionar la sesión de usuario de Firebase y las reglas de acceso. |
| `useSelection` | Custom Hook | Maneja la lógica de selección de elementos 3D, resaltado visual y recuperación de datos de propiedades IFC. |
| `mapBCFTopicToRDI` | `src/utilitario/bcfMapper.js` | Transforma temas BCF al formato RDI interno, integrando una lógica de búsqueda jerárquica para recuperar snapshots binarios (Uint8Array/Base64). |

---

> [!NOTE]
> Esta documentación es un punto de partida para entender la estructura del proyecto y debe actualizarse a medida que se añadan nuevos módulos críticos.
