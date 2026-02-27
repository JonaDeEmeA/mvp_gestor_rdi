import { BIM_COLORS } from '../../constants/designTokens';

// Configuración de layout
export const LAYOUT_CONFIG = {
  sections: {
    header: {
      height: 'auto',
      maxHeight: '120px',
      padding: 2,
      backgroundColor: BIM_COLORS.neutral.background.main,
      borderBottom: '1px solid',
      borderColor: BIM_COLORS.neutral.border
    },
    content: {
      flex: 1,
      overflow: 'auto',
      padding: 2,
      backgroundColor: BIM_COLORS.neutral.background.main,
    },
    footer: {
      height: 'auto',
      maxHeight: '80px',
      padding: 1.5,
      backgroundColor: BIM_COLORS.neutral.background.secondary,
      borderTop: '1px solid',
      borderColor: BIM_COLORS.neutral.border
    }
  },
  spacing: {
    gap: 2,
    buttonGap: 1
  }
};

console.log('✅ PASO 2 COMPLETADO: Configuración de layout creada');