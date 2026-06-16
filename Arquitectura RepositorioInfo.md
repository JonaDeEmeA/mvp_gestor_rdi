# Arquitectura Propuesta: Repositorio de Metadatos BIM

## Introducción

Uno de los mayores desafíos en una plataforma BIM no es visualizar un modelo IFC, sino mantener la continuidad de la información cuando dicho modelo evoluciona durante el ciclo de vida del proyecto.

En un proyecto de construcción es habitual que existan múltiples versiones del modelo IFC:

* IFC Rev.01
* IFC Rev.02
* IFC Rev.03
* ...
* IFC As-Built

Cada nueva versión puede incorporar:

* nuevos elementos
* modificaciones geométricas
* cambios de propiedades
* eliminación de elementos

Si la plataforma almacena toda la información directamente "sobre" un archivo IFC específico, cada actualización del modelo implicaría perder o duplicar información crítica.

Por esta razón, la arquitectura del sistema debe separar completamente el **modelo geométrico** del **conocimiento generado durante la ejecución del proyecto**.

---

# Principio Fundamental

El archivo IFC **NO es la base de datos del proyecto**.

El IFC únicamente representa el estado geométrico del proyecto en un momento determinado.

Toda la información generada por los usuarios debe almacenarse en un repositorio independiente.

En otras palabras:

> El modelo IFC representa la geometría del proyecto.
> El repositorio de metadatos representa el conocimiento acumulado sobre ese proyecto.

---

# El Modelo IFC como Fuente de Geometría

El modelo IFC debe utilizarse únicamente para obtener:

* geometría
* relaciones espaciales
* propiedades originales
* clasificación IFC
* GlobalId

No debe utilizarse para almacenar:

* avance
* incidencias
* fotografías
* comentarios
* costos
* responsables
* planificación
* documentos

Toda esa información pertenece al proyecto, no al archivo IFC.

---

# Repositorio de Metadatos BIM

El núcleo de la plataforma debe ser un **Repositorio de Metadatos BIM**.

Este repositorio constituye la fuente única de verdad para toda la información generada durante la ejecución del proyecto.

Cada elemento del modelo será identificado mediante su **GlobalId**, el cual actuará como llave principal para relacionar toda la información asociada.

Conceptualmente:

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
      ├── Capítulo
      ├── Subcapítulo
      ├── Peso
      ├── Unidad
      ├── Cantidad
      ├── Responsable
      ├── Ruta crítica
      ├── Avance
      ├── Incidencias
      ├── Fotografías
      ├── Comentarios
      ├── Documentos
      ├── Historial
      └── KPIs
```

---

# El IFC como Cliente del Repositorio

Bajo esta arquitectura, el modelo IFC deja de ser el contenedor principal de la información.

Cada vez que un usuario abre un modelo:

1. Se carga el IFC.
2. Se leen todos los GlobalId.
3. Se consulta el Repositorio de Metadatos BIM.
4. Se enriquecen visualmente los elementos.

El modelo actúa únicamente como interfaz gráfica.

```text
            IFC
             │
             ▼
      Lectura GlobalId
             │
             ▼
Repositorio de Metadatos
             │
             ▼
Visualización enriquecida
```

---

# Beneficios de esta Arquitectura

## Persistencia de la información

Los datos sobreviven aunque el modelo IFC cambie.

---

## Independencia del software BIM

La plataforma deja de depender de:

* Revit
* Archicad
* Tekla
* Allplan
* Bentley

Todos ellos producen IFC, pero el conocimiento del proyecto permanece en el repositorio.

---

## Reutilización

La misma información puede ser utilizada por distintos módulos.

Por ejemplo:

Un peso económico podrá ser utilizado por:

* Avance
* Reportes
* KPIs
* Curvas S
* Valor Ganado

Sin duplicar información.

---

## Escalabilidad

Nuevos módulos podrán reutilizar el mismo repositorio.

Por ejemplo:

* Calidad
* Seguridad
* Medio Ambiente
* Planificación
* Inspección
* Mantención

Todos utilizarán la misma fuente de información.

---

# Qué Información Debe Vivir en el Repositorio

## Clasificación del Proyecto

* Capítulo
* Subcapítulo
* Especialidad
* Disciplina

---

## Información Contractual

* Responsable
* Empresa
* Contrato
* Ruta crítica

---

## Información de Producción

* Grupo de avance
* Peso
* Unidad
* Cantidad
* Avance

---

## Información Económica

* Costo
* Presupuesto
* Horas Hombre
* Peso económico

---

## Información de Gestión

* Incidencias
* Observaciones
* Fotografías
* Documentos
* Historial

---

## Información Analítica

* KPIs
* Indicadores
* Curvas
* Snapshots

---

# ¿Qué ocurre cuando se carga un nuevo IFC?

Cuando el usuario importa una nueva versión del modelo, el sistema **NO debe reemplazar el repositorio**.

Debe ejecutar un proceso de sincronización.

## Paso 1

Leer todos los GlobalId del nuevo modelo.

## Paso 2

Compararlos con los GlobalId almacenados en el repositorio.

## Paso 3

Clasificar los resultados en tres grupos.

### Elementos Conservados

El GlobalId existe tanto en el repositorio como en el nuevo IFC.

Resultado:

Se mantiene toda la información.

No requiere intervención.

---

### Elementos Nuevos

El GlobalId existe únicamente en el nuevo IFC.

Resultado:

Se crean registros nuevos.

Inicialmente no poseen metadatos.

---

### Elementos Eliminados

El GlobalId existe únicamente en el repositorio.

Resultado:

No deben eliminarse inmediatamente.

Se marcarán como:

* Obsoleto
* Eliminado del modelo

De esta forma se conserva:

* historial
* fotografías
* incidencias
* auditoría

---

# ¿Qué ocurre si cambia la geometría?

Mientras el GlobalId permanezca igual, el sistema debe considerar que se trata del mismo elemento.

La geometría puede cambiar.

Las dimensiones pueden cambiar.

Las propiedades pueden cambiar.

Pero el conocimiento asociado permanecerá intacto.

---

# ¿Qué ocurre si el modelador elimina un elemento y crea uno nuevo?

Este es el escenario más complejo.

Ejemplo:

Antes:

```text
Wall_001
GlobalId = A1B2C3
```

Después:

```text
Wall_001
GlobalId = X9Y8Z7
```

Aunque visualmente parezca el mismo muro, para IFC son elementos distintos.

El sistema debe tratarlos como:

* un elemento eliminado
* un elemento nuevo

Posteriormente podrá incorporarse una herramienta de reconciliación manual o semiautomática, pero no forma parte del alcance del MVP.

---

# Los Módulos ya no son los dueños de la información

Con esta arquitectura los módulos dejan de almacenar información propia.

Cada módulo únicamente consume o amplía el Repositorio de Metadatos BIM.

Ejemplo:

## Módulo de Incidencias

Consulta:

* elementos
* responsables

Escribe:

* incidencias
* fotografías
* comentarios

---

## Módulo de Avance

Consulta:

* elementos
* pesos
* clasificación

Escribe:

* snapshots
* porcentajes
* evidencias

---

## Módulo de Reportes

Consulta:

* incidencias
* avances
* fotografías
* pesos

No genera información propia.

---

## Módulo de KPIs

Consulta:

* snapshots
* pesos
* planificación

Calcula:

* indicadores
* gráficos
* curvas

---

# El Modelo BIM como Interfaz Principal

Uno de los principios fundamentales de esta plataforma es que el modelo BIM constituye la principal interfaz de interacción.

No se pretende desarrollar un sistema tradicional de gestión al cual posteriormente se le agregue un visor IFC.

El flujo de trabajo debe construirse alrededor del modelo.

Desde un elemento IFC el usuario debe poder:

* consultar incidencias
* registrar avances
* visualizar fotografías
* revisar historial
* acceder a documentos
* conocer responsables
* consultar indicadores

Toda la información converge sobre el mismo elemento identificado mediante su GlobalId.

---

# Beneficios para la Evolución del Producto

Esta arquitectura permite incorporar nuevos módulos sin modificar el núcleo del sistema.

Por ejemplo:

* Gestión de Calidad
* Seguridad
* Medio Ambiente
* Inspecciones
* Checklist
* Planificación
* Costos
* Mantención
* Facility Management

Todos consumirán el mismo repositorio.

No será necesario duplicar información ni redefinir estructuras de datos.

---

# Conclusión

La decisión arquitectónica más importante de la plataforma consiste en separar completamente el **modelo geométrico** del **conocimiento generado durante la ejecución del proyecto**.

El archivo IFC representa únicamente la geometría del proyecto en un instante determinado.

El verdadero activo de la plataforma es el **Repositorio de Metadatos BIM**, el cual conserva de forma persistente toda la información asociada a cada elemento mediante su GlobalId.

Gracias a esta separación, el sistema podrá soportar nuevas versiones del modelo, evolucionar con nuevos módulos y mantener la trazabilidad completa del proyecto sin depender de una versión específica del archivo IFC.
