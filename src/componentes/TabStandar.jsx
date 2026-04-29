import * as React from 'react';
import PropTypes from 'prop-types';
import {
  Tabs,
  Tab,
  Box,
  Button,
  Typography,
  IconButton,
  Tooltip,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Fab,
  Slider
} from '@mui/material';
import {
  Home as HomeIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  FolderOpen as FolderOpenIcon,
  Visibility as VisibilityIcon,
  Build as BuildIcon,
  Layers as LayersIcon,
  Publish as PublishIcon,
  ContentCut as ContentCutIcon,
  ColorLens as ColorIcon
} from '@mui/icons-material';


function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function TabStandar({
  onCargarFile,
  onCloseBrowser,
  onCloseRdiManager,
  onToggleInfoCoordenada,
  pickedPoint,
  onResetCamera,
  sectionEnabled,
  onToggleSection,
  sectionPlanes,
  browserEnabled,
  rdiManagerEnabled,
  infoCoordenadaEnabled,
  onToggleCategoryColor,
  categoryColorEnabled, }) {
  const [value, setValue] = React.useState(0);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [selectedTab, setSelectedTab] = React.useState(0);

  // Detectar si es móvil
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Log de diagnóstico
  React.useEffect(() => {
    console.log('📱 PASO 2.1: Detectando dispositivo - isMobile:', isMobile);
  }, [isMobile]);

  const handleChange = (event, newValue) => {
    console.log('🔄 PASO 2.2: Tab cambiado a:', newValue);
    setValue(newValue);
    setSelectedTab(newValue);

    // En móvil, abrir drawer automáticamente al cambiar
    if (isMobile) {
      setDrawerOpen(true);
    }
  };

  // Función para manejar el clic explícito (permite reabrir el drawer si ya estaba seleccionado)
  const handleTabClick = (index) => {
    if (isMobile) {
      setSelectedTab(index);
      setDrawerOpen(true);
      console.log('📱 PASO 2.3: Reabriendo drawer por clic en tab:', index);
    }
  };

  // Estilos de botones para escritorio
  const buttonStyleOutlined = {
    color: 'white',
    borderColor: 'rgba(255,255,255,0.4)',
    textTransform: 'none',
    '&:hover': {
      bgcolor: 'rgba(255,255,255,0.08)',
      borderColor: 'white'
    }
  };

  const buttonStyleContained = {
    bgcolor: '#4CAF50',
    color: 'white',
    textTransform: 'none',
    '&:hover': {
      bgcolor: '#43A047'
    }
  };

  const getButtonStyle = (isActive) => isActive ? buttonStyleContained : buttonStyleOutlined;

  // Estilos de lista para móvil
  const listItemStyle = {
    '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' }
  };

  const getListItemTextStyle = (isActive) => ({
    color: isActive ? '#4CAF50' : 'white',
    '& .MuiTypography-root': {
      fontWeight: isActive ? 'bold' : 'normal'
    }
  });

  const getListItemIconStyle = (isActive) => ({
    color: isActive ? '#4CAF50' : 'rgba(255,255,255,0.7)'
  });

  // Contenido de herramientas según la pestaña seleccionada
  const getDrawerContent = () => {
    console.log('🎨 PASO 2.4: Renderizando contenido del drawer para tab:', selectedTab);

    switch (selectedTab) {
      case 0: // Archivos
        return (
          <List>
            <ListItem disablePadding>
              <ListItemButton sx={listItemStyle} onClick={() => {
                onCargarFile();
                if (isMobile) setDrawerOpen(false);
              }}>
                <ListItemIcon sx={getListItemIconStyle(false)}>
                  <FolderOpenIcon />
                </ListItemIcon>
                <ListItemText primary="Cargar IFC" sx={getListItemTextStyle(false)} />
              </ListItemButton>
            </ListItem>
          </List>
        );

      case 1: // Ver
        return (
          <List>
            <ListItem disablePadding>
              <ListItemButton sx={listItemStyle} onClick={() => {
                onCloseBrowser();
                if (isMobile) setDrawerOpen(false);
              }}>
                <ListItemIcon sx={getListItemIconStyle(browserEnabled)}>
                  <VisibilityIcon />
                </ListItemIcon>
                <ListItemText primary={browserEnabled ? "Cerrar Explorador" : "Explorador"} sx={getListItemTextStyle(browserEnabled)} />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton sx={listItemStyle} onClick={() => {
                onCloseRdiManager();
                if (isMobile) setDrawerOpen(false);
              }}>
                <ListItemIcon sx={getListItemIconStyle(rdiManagerEnabled)}>
                  <LayersIcon />
                </ListItemIcon>
                <ListItemText primary={rdiManagerEnabled ? "Cerrar Gestor RDI" : "Gestor RDI"} sx={getListItemTextStyle(rdiManagerEnabled)} />
              </ListItemButton>
            </ListItem>
          </List>
        );

      case 2: // Herramientas
        return (
          <List>
            <ListItem disablePadding>
              <ListItemButton sx={listItemStyle} onClick={() => {
                onToggleInfoCoordenada();
                if (isMobile) setDrawerOpen(false);
              }}>
                <ListItemIcon sx={getListItemIconStyle(infoCoordenadaEnabled)}>
                  <BuildIcon />
                </ListItemIcon>
                <ListItemText
                  primary={infoCoordenadaEnabled ? "Cerrar Coordenadas" : "Info Coordenadas"}
                  sx={getListItemTextStyle(infoCoordenadaEnabled)}
                />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton sx={listItemStyle} onClick={() => {
                onToggleCategoryColor();
                if (isMobile) setDrawerOpen(false);
              }}>
                <ListItemIcon sx={getListItemIconStyle(categoryColorEnabled)}>
                  <ColorIcon />
                </ListItemIcon>
                <ListItemText primary={categoryColorEnabled ? "Cerrar Categoría" : "Color por Categoría"} sx={getListItemTextStyle(categoryColorEnabled)} />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton sx={listItemStyle} onClick={() => {
                onToggleSection();
                if (isMobile) setDrawerOpen(false);
              }}>
                <ListItemIcon sx={getListItemIconStyle(sectionEnabled)}>
                  <ContentCutIcon />
                </ListItemIcon>
                <ListItemText primary={sectionEnabled ? "Desactivar Sección" : "Activar Sección"} sx={getListItemTextStyle(sectionEnabled)} />
              </ListItemButton>
            </ListItem>
          </List>
        );

      case 3: // Capas
        return (
          <Box sx={{ p: 2 }}>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
              Panel de capas (Próximamente)
            </Typography>
          </Box>
        );

      case 4: // Publicar
        return (
          <Box sx={{ p: 2 }}>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
              Opciones de publicación (Próximamente)
            </Typography>
          </Box>
        );

      default:
        return null;
    }
  };


  return (

    <Box sx={{ width: '100%', height: { xs: "auto", sm: "15vh" }, position: 'relative', bgcolor: '#1F3A5F', color: 'white', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
      {/* Tabs Header */}
      <Box sx={{ borderBottom: 1, borderColor: 'rgba(255,255,255,0.08)' }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="herramientas tabs"
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: '48px',
            '& .MuiTabs-indicator': {
              backgroundColor: '#4CAF50',
            },
            '& .MuiTab-root': {
              minWidth: { xs: 'auto', sm: 90 },
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              px: { xs: 1, sm: 2 },
              color: 'rgba(255,255,255,0.6)',
              '&.Mui-selected': {
                color: '#4CAF50',
                fontWeight: 'bold'
              }
            }
          }}
        >
          <Tab label="Archivos" {...a11yProps(0)} onClick={() => handleTabClick(0)} />
          <Tab label="Ver" {...a11yProps(1)} onClick={() => handleTabClick(1)} />
          <Tab label="Herramientas" {...a11yProps(2)} onClick={() => handleTabClick(2)} />
          <Tab label="Capas" {...a11yProps(3)} onClick={() => handleTabClick(3)} />
          <Tab label="Publicar" {...a11yProps(4)} onClick={() => handleTabClick(4)} />
        </Tabs>
      </Box>

      {/* Contenido Desktop - Solo visible en pantallas grandes */}
      {!isMobile && (
        <>
          <CustomTabPanel value={value} index={0}>
            <Button size='small' variant="outlined" startIcon={<FolderOpenIcon />} onClick={onCargarFile} sx={getButtonStyle(false)}>
              Cargar IFC
            </Button>
          </CustomTabPanel>
          <CustomTabPanel value={value} index={1}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button sx={{ fontSize: '0.675rem', ...getButtonStyle(browserEnabled) }} size='small' variant={browserEnabled ? 'contained' : 'outlined'} startIcon={<VisibilityIcon />} onClick={onCloseBrowser}>
                {browserEnabled ? 'Cerrar Explorador' : 'Explorador'}
              </Button>
              <Button size='small' variant={rdiManagerEnabled ? 'contained' : 'outlined'} startIcon={<LayersIcon />} onClick={onCloseRdiManager} sx={getButtonStyle(rdiManagerEnabled)}>
                {rdiManagerEnabled ? 'Cerrar RDI' : 'Gestor RDI'}
              </Button>
            </Box>
          </CustomTabPanel>
          <CustomTabPanel value={value} index={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button size='small' variant={infoCoordenadaEnabled ? 'contained' : 'outlined'} startIcon={<BuildIcon />} onClick={onToggleInfoCoordenada} sx={getButtonStyle(infoCoordenadaEnabled)}>
                {infoCoordenadaEnabled ? 'Cerrar Coor' : 'Info Coor'}
              </Button>
              <Button size='small' variant={categoryColorEnabled ? 'contained' : 'outlined'} startIcon={<ColorIcon />} onClick={onToggleCategoryColor} sx={getButtonStyle(categoryColorEnabled)}>
                {categoryColorEnabled ? 'Cerrar Cat' : 'Color Cat'}
              </Button>
              <Button
                size='small'
                variant={sectionEnabled ? 'contained' : 'outlined'}
                onClick={onToggleSection}
                sx={getButtonStyle(sectionEnabled)}
              >
                {sectionEnabled ? 'Desactivar Sección' : 'Activar Sección'}
              </Button>
            </Box>
          </CustomTabPanel>
          <CustomTabPanel value={value} index={3}>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
              Panel de capas (Próximamente)
            </Typography>
          </CustomTabPanel>
          <CustomTabPanel value={value} index={4}>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
              Opciones de publicación (Próximamente)
            </Typography>
          </CustomTabPanel>
        </>
      )}

      {/* Drawer Lateral - Solo en móvil */}
      <Drawer
        anchor="left"
        open={isMobile && drawerOpen}
        onClose={() => {
          console.log('🚪 PASO 2.5: Cerrando drawer');
          setDrawerOpen(false);
        }}
        PaperProps={{
          sx: {
            bgcolor: '#1F3A5F',
            color: 'white',
            width: 280,
            boxSizing: 'border-box',
          }
        }}
        sx={{
          display: { xs: 'block', sm: 'none' }
        }}
      >
        {/* Header del Drawer */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {['Archivos', 'Ver', 'Herramientas', 'Capas', 'Publicar'][selectedTab]}
          </Typography>
          <IconButton onClick={() => setDrawerOpen(false)} sx={{ color: 'rgba(255,255,255,0.85)' }}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Contenido del Drawer */}
        <Box sx={{ overflow: 'auto' }}>
          {getDrawerContent()}
        </Box>
      </Drawer>
    </Box>
  );
}
