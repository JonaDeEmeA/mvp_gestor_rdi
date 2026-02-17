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
  Publish as PublishIcon
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
  infoCoordenadaEnabled, }) {
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

    // En móvil, abrir drawer automáticamente
    if (isMobile) {
      setDrawerOpen(true);
      console.log('📱 PASO 2.3: Abriendo drawer en móvil');
    }
  };

  // Contenido de herramientas según la pestaña seleccionada
  const getDrawerContent = () => {
    console.log('🎨 PASO 2.4: Renderizando contenido del drawer para tab:', selectedTab);

    switch (selectedTab) {
      case 0: // Archivos
        return (
          <List>
            <ListItem disablePadding>
              <ListItemButton onClick={() => {
                onCargarFile();
                if (isMobile) setDrawerOpen(false);
              }}>
                <ListItemIcon>
                  <FolderOpenIcon />
                </ListItemIcon>
                <ListItemText primary="Cargar IFC" />
              </ListItemButton>
            </ListItem>
          </List>
        );

      case 1: // Ver
        return (
          <List>
            <ListItem disablePadding>
              <ListItemButton onClick={() => {
                onCloseBrowser();
                if (isMobile) setDrawerOpen(false);
              }}>
                <ListItemIcon>
                  <VisibilityIcon />
                </ListItemIcon>
                <ListItemText primary={browserEnabled ? "Cerrar Explorador" : "Explorador"} />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={() => {
                onCloseRdiManager();
                if (isMobile) setDrawerOpen(false);
              }}>
                <ListItemIcon>
                  <LayersIcon />
                </ListItemIcon>
                <ListItemText primary={rdiManagerEnabled ? "Cerrar Gestor RDI" : "Gestor RDI"} />
              </ListItemButton>
            </ListItem>
          </List>
        );

      case 2: // Herramientas
        return (
          <List>
            <ListItem disablePadding>
              <ListItemButton onClick={() => {
                onToggleInfoCoordenada();
                if (isMobile) setDrawerOpen(false);
              }}>
                <ListItemIcon>
                  <BuildIcon />
                </ListItemIcon>
                <ListItemText
                  primary={infoCoordenadaEnabled ? "Cerrar Coordenadas" : "Info Coordenadas"}
                  secondary={pickedPoint ?
                    `X: ${pickedPoint.x.toFixed(2)} | Y: ${pickedPoint.y.toFixed(2)} | Z: ${pickedPoint.z.toFixed(2)}`
                    : 'No seleccionado'
                  }
                />
              </ListItemButton>
            </ListItem>
          </List>
        );

      case 3: // Capas
        return (
          <Box sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Panel de capas (Próximamente)
            </Typography>
          </Box>
        );

      case 4: // Publicar
        return (
          <Box sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Opciones de publicación (Próximamente)
            </Typography>
          </Box>
        );

      default:
        return null;
    }
  };


  return (

    <Box sx={{ width: '100%', height: { xs: "auto", sm: "15vh" }, position: 'relative' }}>
      {/* Tabs Header */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="herramientas tabs"
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: '48px',
            '& .MuiTab-root': {
              minWidth: { xs: 'auto', sm: 90 },
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              px: { xs: 1, sm: 2 }
            }
          }}
        >
          <Tab sx={{ color: 'gray' }} label="Archivos" {...a11yProps(0)} />
          <Tab sx={{ color: 'gray' }} label="Ver" {...a11yProps(1)} />
          <Tab sx={{ color: 'gray' }} label="Herramientas" {...a11yProps(2)} />
          <Tab sx={{ color: 'gray' }} label="Capas" {...a11yProps(3)} />
          <Tab sx={{ color: 'gray' }} label="Publicar" {...a11yProps(4)} />
        </Tabs>
      </Box>

      {/* Contenido Desktop - Solo visible en pantallas grandes */}
      {!isMobile && (
        <>
          <CustomTabPanel value={value} index={0}>
            <Button size='small' variant="outlined" startIcon={<FolderOpenIcon />} onClick={onCargarFile}>
              Cargar IFC
            </Button>
          </CustomTabPanel>
          <CustomTabPanel value={value} index={1}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button sx={{ fontSize: '0.675rem' }} size='small' variant={browserEnabled ? 'contained' : 'outlined'} startIcon={<VisibilityIcon />} onClick={onCloseBrowser}>
                {browserEnabled ? 'Cerrar Explorador' : 'Explorador'}
              </Button>
              <Button size='small' variant={rdiManagerEnabled ? 'contained' : 'outlined'} startIcon={<LayersIcon />} onClick={onCloseRdiManager}>
                {rdiManagerEnabled ? 'Cerrar RDI' : 'Gestor RDI'}
              </Button>
            </Box>
          </CustomTabPanel>
          <CustomTabPanel value={value} index={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button size='small' variant={infoCoordenadaEnabled ? 'contained' : 'outlined'} startIcon={<BuildIcon />} onClick={onToggleInfoCoordenada}>
                {infoCoordenadaEnabled ? 'Cerrar Coor' : 'Info Coor'}
              </Button>
              <Button
                size='small'
                variant={sectionEnabled ? 'contained' : 'outlined'}
                onClick={onToggleSection}
              >
                {sectionEnabled ? 'Desactivar Sección' : 'Activar Sección'}
              </Button>
              {pickedPoint && (
                <Typography variant="body2" component="div">
                  <strong>X:</strong> {pickedPoint.x.toFixed(2)} |
                  <strong>Y:</strong> {pickedPoint.y.toFixed(2)} |
                  <strong>Z:</strong> {pickedPoint.z.toFixed(2)}
                </Typography>
              )}
            </Box>
          </CustomTabPanel>
          <CustomTabPanel value={value} index={3}>
            <Typography variant="body2" color="text.secondary">
              Panel de capas (Próximamente)
            </Typography>
          </CustomTabPanel>
          <CustomTabPanel value={value} index={4}>
            <Typography variant="body2" color="text.secondary">
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
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            width: 280,
            boxSizing: 'border-box',
          }
        }}
      >
        {/* Header del Drawer */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}>
          <Typography variant="h6">
            {['Archivos', 'Ver', 'Herramientas', 'Capas', 'Publicar'][selectedTab]}
          </Typography>
          <IconButton onClick={() => setDrawerOpen(false)}>
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
