// Constantes de configuración del visor 3D
export const VIEWER_CONFIG = {
  workerUrl: '/workers/worker.mjs',
  camera: {
    position: { x: 12, y: 10, z: 50 },
    target: [0, 0, 0]
  },
  supportedExtensions: ['ifc', 'frag', 'json'],
  fileAccept: '.ifc,.frag,.json'
};

export const IFC_SETTINGS = {
  coordinate: false,
  includeProperties: true,
  weldVertices: true,
  webIfc: {
    COORDINATE_TO_ORIGIN: false,
    USE_FAST_BOOLEANS: true,
    CIRCLE_SEGMENTS_HIGH: 32,
    OPTIMIZE_PROFILES: true,
    INCLUDE_CURVES: true,
    CURVE_DIVISIONS: 12,
  }
};

export const STYLES = {
  container: {
    minHeight: "100vh",
    minWidth: "100vw",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    background: "#181818",
  },
  viewer: {
    width: "100%",
    height: "83vh",
    borderRadius: 5,
    background: "#222",
    boxShadow: 3,
    display: "block",
    position: "relative",
  },
  browser: {
    position: "absolute",
    top: "20%",
    left: "2%",
    zIndex: 10,
    width: 320,
    pointerEvents: "auto"
  }
};

export const TIMING = {
  geometryAnalysisDelay: 2000
};

export const ERROR_MESSAGES = {
  VIEWER_INIT: 'Error inicializando el visor 3D',
  FILE_PROCESSING: 'Error procesando el archivo',
  FRAGMENTS_MANAGER: 'El gestor de fragmentos no está inicializado',
  INVALID_FILE: 'Archivo no válido o corrupto',
  UNSUPPORTED_FORMAT: 'Formato de archivo no soportado',
  NETWORK_ERROR: 'Error de conexión o descarga',
  MEMORY_ERROR: 'Memoria insuficiente para procesar el archivo'
};