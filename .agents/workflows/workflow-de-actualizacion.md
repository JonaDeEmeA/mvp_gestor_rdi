---
description: 
---

Actúa como un editor incremental. Lee el diff de los cambios recientes. Si hay una nueva función o un cambio en la lógica de una existente, busca la sección correspondiente en antigravity.md y actualízala. REGLA DE ORO: No reescribas todo el archivo, solo modifica o añade las líneas necesarias para mantener la coherencia con el código nuevo.

Rol: Editor Incremental de Documentación.
Entrada: Analiza el diff de los archivos de código modificados en esta sesión.

Tarea:

Evaluación de Relevancia: Determina si los cambios afectan la lógica, los parámetros de una función o la arquitectura. Si solo son cambios de formato (espacios, nombres de variables internas, comentarios), finaliza el proceso sin hacer nada.

Localización: Si el cambio es relevante, lee el archivo antigravity.md existente. Identifica el bloque o la sección que describe la función o módulo afectado.

Actualización Precisa: >    - Si la función ya existe en el Markdown: Reescribe únicamente esa descripción o su tabla de parámetros para que coincida con el nuevo código.

Si la función es nueva: Añádela al final de la sección correspondiente (ej. 'Diccionario de Funciones') siguiendo el formato actual.

Si se ha eliminado una funcionalidad: Borra su entrada correspondiente del Markdown.

Restricción de Consumo: Queda estrictamente prohibido regenerar el archivo completo. Solo debes emitir un "patch" o edición de las líneas afectadas. Mantén intactos los encabezados y la estructura general del documento.

Formato de salida esperado: Markdown actualizado.

Usa la siguiente configuración técnica para procesar los cambios:

{
  "mode": "incremental_edit",
  "priority": "precision_over_length",
  "token_saving_rules": {
    "skip_on_trivial_changes": true,
    "max_context_window": "only_affected_files",
    "target_file": "antigravity.md"
  },
  "change_detection": {
    "signature_change": "update",
    "logic_refactor": "update",
    "new_export": "append"
  }
}