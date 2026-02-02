// Configuración de layout
export const LAYOUT_CONFIG = {
  sections: {
    header: {
      height: 'auto',
      maxHeight: '120px',
      padding: 2,
      backgroundColor: 'background.paper',
      borderBottom: '1px solid',
      borderColor: 'divider'
    },
    content: {
      flex: 1,
      overflow: 'auto',
      padding: 2
    },
    footer: {
      height: 'auto',
      maxHeight: '80px',
      padding: 1.5,
      backgroundColor: 'grey.50',
      borderTop: '1px solid',
      borderColor: 'divider'
    }
  },
  spacing: {
    gap: 2,
    buttonGap: 1
  }
};

console.log('✅ PASO 2 COMPLETADO: Configuración de layout creada');