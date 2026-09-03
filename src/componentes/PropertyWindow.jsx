import {
  Typography,
  Box,
  Divider,
  List,
  ListItem,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import FloatingWindow from './FloatingWindow';

/**
 * Extrae el valor legible de una propiedad IFC.
 */
const QUANTITY_VALUE_KEYS = ['LengthValue', 'AreaValue', 'VolumeValue', 'CountValue', 'WeightValue', 'TimeValue'];

const QUANTITY_UNITS = {
  LengthValue: 'm',
  AreaValue: 'm²',
  VolumeValue: 'm³',
  CountValue: 'ud',
  WeightValue: 'kg',
  TimeValue: 'h',
};

const formatQuantityValue = (value) => {
  const num = Number(value);
  if (isNaN(num)) return String(value);
  return num.toFixed(3).replace(/\.?0+$/, '');
};

const getPropertyValue = (property) => {
  if (property === null || property === undefined) return '';
  if (typeof property !== 'object') return String(property);
  if (property.value !== undefined) return String(property.value);
  if (property.NominalValue?.value !== undefined) return String(property.NominalValue.value);
  for (const key of QUANTITY_VALUE_KEYS) {
    if (property[key]?.value !== undefined) {
      const formatted = formatQuantityValue(property[key].value);
      const unit = QUANTITY_UNITS[key] || '';
      return unit ? `${formatted} ${unit}` : formatted;
    }
  }
  return 'Complejo';
};

/**
 * Renderiza una lista plana de propiedades clave-valor.
 */
const PropertyList = ({ data }) => {
  if (!data) return null;
  
  const entries = Object.entries(data).filter(([key, value]) => {
    if (value === null || value === undefined) return false;
    return typeof value !== 'object' || value.value !== undefined;
  });

  if (entries.length === 0) return null;

  return (
    <List dense sx={{ width: '100%', p: 0 }}>
      {entries.map(([key, value]) => (
        <ListItem 
          key={key} 
          divider 
          sx={{ 
            px: 0, 
            py: 0.5,
            flexDirection: 'column', 
            alignItems: 'flex-start' 
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'primary.main', textTransform: 'uppercase', fontSize: '0.65rem' }}>
            {key}
          </Typography>
          <Typography variant="body2" sx={{ fontSize: '0.85rem', wordBreak: 'break-all' }}>
            {getPropertyValue(value)}
          </Typography>
        </ListItem>
      ))}
    </List>
  );
};

const isQto = (name) => name?.startsWith('Qto_');

const PropertyWindow = ({ open, onClose, properties }) => {
  
  const renderContent = () => {
    if (!properties) return null;

    const { attributes, psets, spatialContainer } = properties;

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {/* Espacio contenedor (nivel / storey) */}
        {spatialContainer && (
          <Paper variant="outlined" sx={{ p: 1, bgcolor: 'rgba(76, 175, 80, 0.06)', borderRadius: 1.5, borderColor: 'rgba(76, 175, 80, 0.2)' }}>
            <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'success.main', textTransform: 'uppercase', fontSize: '0.62rem' }}>
              Nivel Contenedor
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
              {spatialContainer.name || spatialContainer.type || '—'}
            </Typography>
          </Paper>
        )}

        {/* Sección de Atributos del Elemento */}
        <Accordion defaultExpanded sx={{ boxShadow: 'none', '&:before': { display: 'none' }, bgcolor: 'transparent' }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle2" fontWeight="bold">Atributos Base</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 0 }}>
            <PropertyList data={attributes} />
          </AccordionDetails>
        </Accordion>

        {/* Secciones de Property Sets y Quantity Take-Offs */}
        {psets && psets.map((pset, index) => (
          <Accordion key={index} sx={{ boxShadow: 'none', '&:before': { display: 'none' }, bgcolor: 'transparent' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle2" fontWeight="bold">
                {isQto(pset.name) ? '📐 ' : ''}{pset.name}
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0 }}>
              <PropertyList data={pset.properties} />
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    );
  };

  return (
    <FloatingWindow
      open={open}
      onClose={onClose}
      title="Propiedades IFC"
      height="500px"
      width="350px"
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {properties ? (
          <Box>
            {/* Cabecera con Nombre y Tipo */}
            <Paper variant="outlined" sx={{ p: 1.5, mb: 1, bgcolor: 'rgba(31, 58, 95, 0.04)', borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'primary.dark' }}>
                {getPropertyValue(properties.attributes?.Name) || "Sin Nombre"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Tipo: {getPropertyValue(properties.attributes?.type) || 'N/A'}
              </Typography>
            </Paper>
            
            <Box sx={{ flex: 1 }}>
               {renderContent()}
            </Box>
          </Box>
        ) : (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            py: 8, 
            opacity: 0.5 
          }}>
            <Typography variant="h4">🔍</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Selecciona un elemento para ver sus datos
            </Typography>
          </Box>
        )}
      </Box>
    </FloatingWindow>
  );
};

export default PropertyWindow;
