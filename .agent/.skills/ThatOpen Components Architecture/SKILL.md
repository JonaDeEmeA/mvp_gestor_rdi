--- 
name: ThatOpen Components Architecture 
description: Este skill guía la inicialización del sistema, gestión de componentes, carga de modelos IFC, interacción con geometría y visualización avanzada.
---

## Purpose
Proveer conocimiento experto para implementar aplicaciones 3D BIM usando la librería @thatopen/components, siguiendo su arquitectura centralizada, patrones de uso correctos y prácticas de alto rendimiento.

---

## Scope

### Incluye
- Arquitectura central y patrón Singleton
- Sistema Components
- Worlds y entorno 3D
- Gestión de fragmentos BIM
- Herramientas de análisis espacial
- Renderizado y visualización
- Sistema BCF
- UI reactiva
- Buenas prácticas de implementación

### Excluye
- Three.js puro sin integración
- Patrones genéricos de WebGL
- Implementaciones fuera del ecosistema ThatOpen

---

## When to Use
- Construcción de visores BIM
- Aplicaciones con modelos IFC
- Sistemas 3D con múltiples vistas
- Herramientas de análisis espacial
- Aplicaciones con arquitectura modular

---

## When NOT to Use
- Aplicaciones 3D simples sin gestión de estado
- Proyectos sin arquitectura centralizada
- Rendering directo con Three.js sin componentes

---

# Core Concepts

## Arquitectura Centralizada

La librería se basa en:

- Modularidad extrema
- Service Locator
- Singleton por contexto
- Única fuente de verdad

Todos los componentes se gestionan desde una instancia central.

---

## Components: Núcleo del Sistema

Clase obligatoria que:

- Orquesta ciclo de vida
- Gestiona recursos GPU
- Evita fugas de memoria
- Provee acceso global a herramientas
- Mantiene lista de componentes activos

### Responsabilidades
- Crear componentes
- Registrar componentes
- Actualizar componentes
- Liberar recursos

### Métodos principales

#### get<T>(component): T
Recupera o crea instancia Singleton.

#### init(): void
Inicia loop de actualización global.

#### dispose(): void
Libera recursos recursivamente.

### Propiedades
- list → mapa de componentes activos

### Regla crítica
Nunca instanciar componentes manualmente.

---

## Configuración Global

### ConfigManager
Gestión centralizada de parámetros globales.

### EventManager
Control de eventos globales activables/desactivables.

Previene listeners huérfanos.

---

## Worlds: Entornos 3D Aislados

Un World encapsula:

- Scene
- Camera
- Renderer (opcional)

Permite múltiples vistas independientes.

Ejemplos:
- Vista 2D + vista 3D simultánea
- Configuraciones independientes

---

## Estructura de un World

### SimpleScene
Extiende THREE.Scene.
Configura luces automáticamente.

### SimpleCamera
Basada en camera-controls.
Navegación fluida.

### SimpleRenderer
Wrapper de WebGLRenderer.
Gestiona canvas y resize.

---

## Cámaras Especializadas

### SimpleCamera
Uso básico.

### OrthoPerspectiveCamera
- Proyección ortográfica + perspectiva
- Uso BIM profesional

### Navigation Modes
- OrbitMode
- FirstPersonMode
- PlanMode

---

## Sistema de Fragmentos (BIM Performance Engine)

Formato binario optimizado para modelos IFC.

Ventajas:
- Reduce draw calls
- Minimiza memoria
- Renderiza millones de polígonos

---

## FragmentsManager

Responsable de:

- Cargar modelos
- Gestionar buffers
- Eliminar modelos
- Acceder a metadata

### Implementación experta

- Uso de Web Workers
- Sincronización de materiales
- Manejo de z-fighting
- Gestión de fragments.list

---

## IfcLoader

Convierte IFC → fragmentos.

Requiere:
- web-ifc configurado
- rutas WASM correctas

### Configuración

- Posicionamiento del modelo
- Exclusión de clases IFC
- Procesamiento de relaciones espaciales

---

# API Reference

## Class: Components

### Properties
- list: Map

### Methods
- get<T>(component): T
- init(): void
- dispose(): void

### Example
```js
const components = new OBC.Components()
const clipper = components.get(OBC.Clipper)
components.init()

---

### Class: Clipper

Componente ligero para crear, eliminar y gestionar planos de sección (clipping planes).

#### Properties

* 
**list**: `DataMap<string, SimplePlane>` → Lista de todos los planos de sección creados por este componente.


* 
**enabled**: `boolean` → Indica si el componente está activo o no.


* 
**material**: `MeshBasicMaterial` → El material de la representación visual del plano.



#### Methods

* 
**create()**: `void` → Crea un nuevo plano de sección.


* 
**delete(plane?)**: `void` → Elimina un plano específico o todos si no se provee uno.


* 
**deleteAll(types?)**: `void` → Elimina todos los planos, opcionalmente filtrados por tipo.


* 
**dispose()**: `void` → Libera los recursos del componente.



#### Example

```js
const clipper = components.get(OBC.Clipper);
clipper.create();
clipper.enabled = true;

```

---

### Class: Classifier

Responsable de agrupar elementos de diferentes modelos basándose en criterios específicos.

#### Properties

* 
**list**: `DataMap<string, DataMap<string, ClassificationGroupData>>` → Mapa anidado que organiza los grupos de clasificación.



#### Methods

* 
**addGroupItems(classification, group, items)**: `void` → Añade ítems a un grupo específico dentro de una clasificación.


* 
**aggregateItems(classification, query, config?)**: `Promise<void>` → Agrupa ítems aplicando una función personalizada según una consulta.


* 
**removeItems(modelIdMap, config?)**: `void` → Elimina ítems del clasificador.



#### Example

```js
const classifier = components.get(OBC.Classifier);
await classifier.byCategory();
console.log(classifier.list);

```

---

### Class: BoundingBoxer

Utilidades para el cálculo de cajas delimitadoras (bounding boxes) orientadas a fragmentos.

#### Properties

* 
**list**: `DataSet<Box3>` → Conjunto de instancias de `THREE.Box3` calculadas.



#### Methods

* 
**addFromModelIdMap(items)**: `Promise<void>` → Añade cajas delimitadoras combinando modelos y IDs locales.


* 
**get()**: `Box3` → Combina todas las cajas de la lista en una sola caja delimitadora global.


* 
**getCenter(modelIdMap)**: `Promise<Vector3>` → Calcula el punto central de la caja delimitadora de un conjunto de ítems.


* 
**reset()**: `void` → Limpia la lista de cajas delimitadoras.



---

### Class: BCFTopics

Gestiona datos en formato BCF (Building Collaboration Format) para importar, exportar y manipular incidencias.

#### Properties

* 
**usedLabels**: `Set<string>` → Etiquetas únicas utilizadas en todos los temas.


* 
**usedStatuses**: `Set<string>` → Estados únicos utilizados en los temas.



#### Methods

* 
**create(data?)**: `Topic` → Crea un nuevo tema BCF y lo añade a la lista.


* 
**load(data)**: `Promise<object>` → Carga datos BCF (Uint8Array) en el motor.


* 
**updateExtensions()**: `void` → Actualiza tipos, estados y prioridades basados en los temas actuales.



---

### Class: AsyncEvent<T>

Manejador de eventos asíncronos simple.

#### Properties

* 
**enabled**: `boolean` → Determina si el evento está activo.



#### Methods

* 
**add(handler)**: `void` → Añade una función de retorno (callback) al evento.


* 
**trigger(data?)**: `Promise<void>` → Dispara todos los callbacks asignados con los datos proporcionados.


* 
**reset()**: `void` → Elimina todas las suscripciones al evento.

---

### Clases Abstractas (Base para desarrollo)

* 
**Base**: Clase raíz para identificar interfaces implementadas (`isConfigurable`, `isDisposeable`, etc.).


* 
**BaseWorldItem**: Clase base para elementos del mundo como escenas, cámaras o renderizadores.


* 
**BaseCamera / BaseScene / BaseRenderer**: Estructuras base para implementar cámaras (Three.js), escenas con luces y renderizadores con planos de corte.
---

### Class: Components

Es el punto de entrada principal de la librería. Gestiona el ciclo de vida de todos los componentes, su actualización y la liberación de memoria.

#### Properties

* **list**: `DataMap<string, Component>` → Mapa de todos los componentes creados. Las llaves son los UUIDs.
* **enabled**: `boolean` → Si es `false`, detiene el bucle de animación global.
* **release**: `string` → Versión actual de la librería (ej. "2.4.3").

#### Methods

* **get<U>(Component)**: `U` → Obtiene una instancia de un componente por su constructor. Si no existe, la crea.
* **init()**: `void` → Inicializa la instancia, activa el bucle de animación y dispara el evento `onInit`.
* **dispose()**: `void` → Libera la memoria de todos los componentes y herramientas para evitar fugas.

#### Example

```js
const components = new OBC.Components();
components.onInit.add(() => { console.log("Librería lista"); });
components.init();
const clipper = components.get(OBC.Clipper);

```

---

### Class: ConfigManager

Herramienta centralizada para gestionar la configuración de toda la aplicación.

#### Properties

* **list**: `DataMap<string, Configurator<any, any>>` → Lista de todas las configuraciones activas.

#### Methods

* **isConfigurable()**: `boolean` → Verifica si un componente puede ser configurado.

---

### Class: Disposer

Utilidad para eliminar de forma segura objetos de Three.js (mallas, geometrías, materiales) de la memoria.

#### Methods

* **destroy(object, materials?, recursive?)**: `void` → Elimina un objeto 3D y opcionalmente sus materiales y sub-objetos.
* **disposeGeometry(geometry)**: `void` → Elimina específicamente una geometría de la memoria.

---

### Class: FastModelPicker

Alternativa rápida al raycasting para identificar modelos bajo el cursor mediante codificación de colores.

#### Properties

* **enabled**: `boolean` → Activa o desactiva el selector.
* **world**: `World` → Referencia al mundo (escena/cámara) donde opera.

#### Methods

* **getModelAt(position?)**: `Promise<string | null>` → Devuelve el ID del modelo en una posición de pantalla.

---

### Class: DataMap<K, V>

Extensión del `Map` nativo de JavaScript con eventos integrados para cambios en los datos.

#### Methods

* **add(value)**: `K` → Añade un valor generando automáticamente un UUID como llave.
* **set(key, value)**: `this` → Establece un valor y dispara eventos `onItemSet` o `onItemUpdated`.
* **onItemDeleted**: `Event<K>` → Evento que se dispara al borrar un elemento.

---

### Class: Event<T> / AsyncEvent<T>

Manejadores de eventos simples (síncronos y asíncronos).

#### Methods

* **add(handler)**: `void` → Suscribe un callback al evento.
* **trigger(data?)**: `void | Promise<void>` → Ejecuta todos los callbacks suscritos.
* **reset()**: `void` → Elimina todos los suscriptores.

---

### Class: Comment (BCF)

Representa un comentario dentro de un tema (Topic) de BCF.

#### Properties

* **comment**: `string` → El texto del comentario. Al editarlo, actualiza automáticamente la fecha y el autor.

---

### Clase Abstracta: Component

Base para todas las funcionalidades de la librería. Los componentes son **Singletons** dentro de una instancia de `Components`.

#### Properties

* **enabled**: `boolean` → Determina si el componente está activo (si está desactivado, no se actualiza por frame).
* **uuid**: `string` (estático) → Identificador único para el registro en el sistema.
---

### Class: FragmentsManager

Componente para cargar, eliminar y gestionar fragmentos (la unidad básica de geometría de la librería) de forma eficiente.

#### Properties

* **list**: `DataMap<string, FragmentsModel>` → Mapa de todos los modelos de fragmentos cargados, indexados por su identificador único.
* **onFragmentsLoaded**: `Event<any>` → Evento que se dispara cuando se termina de cargar un conjunto de fragmentos.

#### Methods

* **dispose()**: `void` → Libera la memoria de todos los fragmentos gestionados.
* **modelIdMapToGuids(modelIdMap)**: `Promise<string[]>` → Convierte un mapa de IDs de fragmentos en una colección de GUIDs globales.

---

### Class: IfcLoader

Responsable de convertir archivos IFC en fragmentos compatibles con el motor 3D.

#### Properties

* **settings**: `IfcFragmentSettings` → Configuración de la conversión (rutas de WASM, exclusión de categorías, etc.).
* **onIfcStartedLoading**: `Event<void>` → Se dispara al iniciar la lectura del archivo.

#### Methods

* **setup(config?)**: `Promise<void>` → Configura el cargador, incluyendo las rutas de las librerías Web-IFC.
* **load(data)**: `Promise<FragmentsModel>` → Procesa un archivo IFC (Uint8Array) y devuelve el modelo de fragmentos resultante.

#### Example

```js
const ifcLoader = components.get(OBC.IfcLoader);
await ifcLoader.setup();
const model = await ifcLoader.load(ifcData);

```

---

### Class: Hider

Gestiona la visibilidad de los fragmentos dentro de la escena 3D.

#### Methods

* **set(visible, modelIdMap?)**: `Promise<void>` → Cambia la visibilidad de los ítems. Si no se pasa un mapa, afecta a todos los fragmentos.
* **isolate(modelIdMap)**: `Promise<void>` → Oculta todo excepto los elementos definidos en el mapa.
* **toggle(modelIdMap)**: `Promise<void>` → Alterna el estado de visibilidad de los elementos indicados.

---

### Class: FinderQuery

Representa una consulta de búsqueda avanzada para recuperar ítems basados en parámetros específicos.

#### Properties

* **result**: `ModelIdMap | null` → El resultado de la última ejecución de la consulta.
* **cache**: `boolean` → Determina si los resultados deben almacenarse en caché.

#### Methods

* **test(config?)**: `Promise<ModelIdMap>` → Ejecuta la consulta y devuelve los elementos que coinciden con los criterios.
* **clearCache()**: `void` → Limpia los resultados almacenados para forzar una nueva evaluación.

---

### Class: IDSSpecifications

Gestiona datos IDS (Information Delivery Specification) para validar requisitos en los modelos.

#### Methods

* **load(xmlData)**: `IDSSpecification[]` → Parsea un string XML con datos IDS y crea las instancias de especificación.
* **create(name, ifcVersion)**: `IDSSpecification` → Crea una nueva especificación manualmente.
* **getModelIdMap(result)**: `object` → Categoriza los resultados de un test en elementos que pasan o fallan.

---

### Class: Grids

Gestiona instancias de rejillas (grids) asociadas a diferentes mundos.

#### Properties

* **list**: `Map<string, SimpleGrid>` → Mapa que vincula UUIDs de mundos con sus respectivas rejillas.

#### Methods

* **create(world)**: `SimpleGrid` → Crea una rejilla para el mundo especificado.
* **delete(world)**: `void` → Elimina y libera la rejilla de un mundo.

---

### Class: FastModelPickers

Gestor de selectores rápidos que utilizan codificación por colores para identificar modelos bajo el cursor.

#### Methods

* **get(world)**: `FastModelPicker` → Obtiene o crea un selector para un mundo específico.
* **delete(world)**: `void` → Elimina el selector asociado a un mundo.

---

### Class: FirstPersonMode

Modo de navegación que simula la cámara de un juego en primera persona (FPS).

#### Properties

* **enabled**: `boolean` → Indica si el modo está activo.
* **id**: `"FirstPerson"` → Identificador único del modo de navegación.

#### Methods

* **set(active)**: `void` → Activa o desactiva los controles de primera persona.
---

### Class: FragmentsManager

Componente para cargar, eliminar y gestionar fragmentos (la unidad básica de geometría de la librería) de forma eficiente.

#### Properties

* **list**: `DataMap<string, FragmentsModel>` → Mapa de todos los modelos de fragmentos cargados, indexados por su identificador único.
* **onFragmentsLoaded**: `Event<any>` → Evento que se dispara cuando se termina de cargar un conjunto de fragmentos.

#### Methods

* **dispose()**: `void` → Libera la memoria de todos los fragmentos gestionados.
* **modelIdMapToGuids(modelIdMap)**: `Promise<string[]>` → Convierte un mapa de IDs de fragmentos en una colección de GUIDs globales.

---

### Class: IfcLoader

Responsable de convertir archivos IFC en fragmentos compatibles con el motor 3D.

#### Properties

* **settings**: `IfcFragmentSettings` → Configuración de la conversión (rutas de WASM, exclusión de categorías, etc.).
* **onIfcStartedLoading**: `Event<void>` → Se dispara al iniciar la lectura del archivo.

#### Methods

* **setup(config?)**: `Promise<void>` → Configura el cargador, incluyendo las rutas de las librerías Web-IFC.
* **load(data)**: `Promise<FragmentsModel>` → Procesa un archivo IFC (Uint8Array) y devuelve el modelo de fragmentos resultante.

#### Example

```js
const ifcLoader = components.get(OBC.IfcLoader);
await ifcLoader.setup();
const model = await ifcLoader.load(ifcData);

```

---

### Class: Hider

Gestiona la visibilidad de los fragmentos dentro de la escena 3D.

#### Methods

* **set(visible, modelIdMap?)**: `Promise<void>` → Cambia la visibilidad de los ítems. Si no se pasa un mapa, afecta a todos los fragmentos.
* **isolate(modelIdMap)**: `Promise<void>` → Oculta todo excepto los elementos definidos en el mapa.
* **toggle(modelIdMap)**: `Promise<void>` → Alterna el estado de visibilidad de los elementos indicados.

---

### Class: FinderQuery

Representa una consulta de búsqueda avanzada para recuperar ítems basados en parámetros específicos.

#### Properties

* **result**: `ModelIdMap | null` → El resultado de la última ejecución de la consulta.
* **cache**: `boolean` → Determina si los resultados deben almacenarse en caché.

#### Methods

* **test(config?)**: `Promise<ModelIdMap>` → Ejecuta la consulta y devuelve los elementos que coinciden con los criterios.
* **clearCache()**: `void` → Limpia los resultados almacenados para forzar una nueva evaluación.

---

### Class: IDSSpecifications

Gestiona datos IDS (Information Delivery Specification) para validar requisitos en los modelos.

#### Methods

* **load(xmlData)**: `IDSSpecification[]` → Parsea un string XML con datos IDS y crea las instancias de especificación.
* **create(name, ifcVersion)**: `IDSSpecification` → Crea una nueva especificación manualmente.
* **getModelIdMap(result)**: `object` → Categoriza los resultados de un test en elementos que pasan o fallan.

---

### Class: Grids

Gestiona instancias de rejillas (grids) asociadas a diferentes mundos.

#### Properties

* **list**: `Map<string, SimpleGrid>` → Mapa que vincula UUIDs de mundos con sus respectivas rejillas.

#### Methods

* **create(world)**: `SimpleGrid` → Crea una rejilla para el mundo especificado.
* **delete(world)**: `void` → Elimina y libera la rejilla de un mundo.

---

### Class: FastModelPickers

Gestor de selectores rápidos que utilizan codificación por colores para identificar modelos bajo el cursor.

#### Methods

* **get(world)**: `FastModelPicker` → Obtiene o crea un selector para un mundo específico.
* **delete(world)**: `void` → Elimina el selector asociado a un mundo.

---

### Class: FirstPersonMode

Modo de navegación que simula la cámara de un juego en primera persona (FPS).

#### Properties

* **enabled**: `boolean` → Indica si el modo está activo.
* **id**: `"FirstPerson"` → Identificador único del modo de navegación.

#### Methods

* **set(active)**: `void` → Activa o desactiva los controles de primera persona.


