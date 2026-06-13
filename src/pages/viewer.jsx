"use client";
import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Box, Typography, Fab, Tooltip,
  Avatar, Button, Divider, CircularProgress,
  AppBar, Toolbar, IconButton, Drawer, List,
  ListItem, ListItemIcon, ListItemText, Backdrop,
} from '@mui/material';
import {
  Home as HomeIcon,
  Dashboard as DashboardIcon,
  Logout as LogoutIcon,
  Assignment as PropertyIcon,
  Menu as MenuIcon,
  Palette as PaletteIcon,
} from '@mui/icons-material';

import { useAuth } from '../hooks/useAuth';
import { useRouter } from 'next/router';

import TabStandar from "@/componentes/TabStandar";
import Browser from "@/componentes/Browser";
import TabTools from "@/componentes/TabTools";

// Hooks personalizados
import { useViewer3D } from '../hooks/useViewer3D';
import { useViewerState } from '../hooks/useViewerState';
import { useVertexPicker } from '@/hooks/useVertexPicker';
import { usePropertySelection } from '@/hooks/usePropertySelection';
import { useFileProcessor } from '../hooks/useFileProcessor';
import { useSection } from '@/hooks/useSection';
import SectionManagerWindow from '@/componentes/SectionManagerWindow';
import CoordinateInfoWindow from '@/componentes/CoordinateInfoWindow';
import CategoryColorWindow from '@/componentes/CategoryColorWindow';
import PropertyWindow from '@/componentes/PropertyWindow';
import ProgressPanel from '@/componentes/Progress/ProgressPanel';
import { useLocalModels } from '@/hooks/useLocalModels';
import { useBIMColors } from '@/hooks/useBIMColors';
import { Warning as WarningIcon } from '@mui/icons-material';
// Constantes
import { STYLES, VIEWER_CONFIG } from '../constants/viewerConfig';
import React from 'react';

const APPBAR_HEIGHT = 48; // px — barra compacta estilo Autodesk

export default function Home() {
  const clickPosRef = useRef({ x: 0, y: 0 });

  // Auth & navegación
  const authHook = useAuth();
  const router = useRouter();
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const user = authHook?.user || { email: 'usuario@demo.com', displayName: 'Usuario Demo' };

  const handleLogout = async () => {
    if (!authHook?.logout) return;
    setLogoutLoading(true);
    try {
      const result = await authHook.logout();
      if (result.success) router.push('/');
    } finally {
      setLogoutLoading(false);
    }
  };

  // Hooks personalizados
  const {
    containerRef,
    componentsRef,
    worldRef,
    fragmentsRef,
    topicRef,
    highlighterRef,
    resetCamera,
    isViewerReady
  } = useViewer3D();

  // Hook de sección
  const { enabled, planesList, toggle, deletePlane, togglePlane } = useSection(
    componentsRef.current,
    worldRef.current,
    containerRef,
    isViewerReady
  );

  const {
    importedModels,
    setImportedModels,
    showBrowser,
    showRDIManager,
    showProgressManager,
    showBIMColors,
    showInfoCoordenada,
    showCategoryColor,
    showProperties,
    selectedEntityProps,
    isMobile,
    toggleBrowser,
    toggleRDIManager,
    toggleProgressManager,
    toggleBIMColors,
    toggleInfoCoordenada,
    toggleCategoryColor,
    toggleProperties,
    setSelectedEntityProps,
    closeFloatingWindows,
    createToggleModelVisibility,
  } = useViewerState();



  // Hook para coordenadas
  const { pickedPoint, pickVertex } = useVertexPicker(componentsRef.current, worldRef.current);

  // Hook para propiedades
  const { pickEntity, selectedGuid } = usePropertySelection(
    componentsRef.current,
    worldRef.current,
    highlighterRef.current,
    setSelectedEntityProps
  );

  const bimColors = useBIMColors(fragmentsRef.current, highlighterRef.current);
  const bimDataRef = useRef({ groups: [], getElementsByGroup: null });

  useEffect(() => {
    if (showBIMColors) {
      const { groups, getElementsByGroup } = bimDataRef.current;
      if (groups.length > 0 && getElementsByGroup) {
        bimColors.applyAllGroups(groups, getElementsByGroup);
      }
    } else {
      bimColors.clearAll();
    }
  }, [showBIMColors, bimColors]);

  const selectedElementType = selectedEntityProps?.attributes?.ObjectType?.value
    || selectedEntityProps?.attributes?.Name?.value
    || '';

  const handleHighlightByGuids = useCallback(async (guids) => {
    const highlighter = highlighterRef.current;
    const fragmentsManager = fragmentsRef.current;
    if (!highlighter || !fragmentsManager) return;

    highlighter.clear("select");
    if (guids.length === 0) return;

    try {
      const modelIdMap = await fragmentsManager.guidsToModelIdMap(guids);
      await highlighter.highlightByID("select", modelIdMap);
    } catch (err) {
      console.warn('[ProgressPanel] Error al resaltar elementos:', err);
    }
  }, [fragmentsRef, highlighterRef]);

  const { fileInputRef, openFileDialog, handleFileSelection, processFile, processing } = useFileProcessor(
    componentsRef,
    worldRef,
    fragmentsRef,
    setImportedModels
  );

  const {
    models: localModels,
    needsPermission: localNeedsPermission,
    authorize: localAuthorize,
    connect: localConnect,
    getFileFromHandle,
    saveFrag
  } = useLocalModels();

  // Crear función de toggle de visibilidad con fragmentsRef
  const handleToggleModelVisibility = createToggleModelVisibility(fragmentsRef);

  // Manejadores locales para coordinar exclusividad con la herramienta de sección
  const handleToggleSection = () => {
    if (!enabled) closeFloatingWindows();
    toggle();
  };

  const handleToggleBrowser = () => {
    if (!showBrowser && enabled) toggle();
    toggleBrowser();
  };

  const handleToggleInfoCoordenada = () => {
    if (!showInfoCoordenada && enabled) toggle();
    toggleInfoCoordenada();
  };

  const handleToggleCategoryColor = () => {
    if (!showCategoryColor) closeFloatingWindows();
    toggleCategoryColor();
  };

  const handleToggleProperties = () => {
    if (!showProperties) closeFloatingWindows();
    toggleProperties();
  };



  const [autoOpenForm, setAutoOpenForm] = useState(false);
  const [autoEditId, setAutoEditId] = useState(null);
  const [autoViewId, setAutoViewId] = useState(null);
  const loadingModelsRef = useRef(new Set());

  // Efecto para activar herramientas desde la URL (ej: desde el Dashboard)
  useEffect(() => {
    if (router.query.tool === 'rdi' && !showRDIManager) {
      toggleRDIManager();
    }

    if (router.query.tool === 'rdi') {
      if (router.query.editId) {
        setAutoEditId(router.query.editId);
      } else if (router.query.viewId) {
        setAutoViewId(router.query.viewId);
      } else if (!showRDIManager) {
        setAutoOpenForm(true);
      }

      // Limpiar parámetros de RDI
      const { tool, editId, viewId, ...restQuery } = router.query;
      router.replace({ pathname: router.pathname, query: restQuery }, undefined, { shallow: true });
    }

    if (router.query.tool === 'progress' && !showProgressManager) {
      toggleProgressManager();
      const { tool, ...restQuery } = router.query;
      router.replace({ pathname: router.pathname, query: restQuery }, undefined, { shallow: true });
    }
  }, [router.query.tool, router.query.editId, router.query.viewId, showRDIManager, toggleRDIManager, showProgressManager, toggleProgressManager, router]);

  // Efecto para cargar modelo local desde URL
  useEffect(() => {
    const loadModelFromUrl = async () => {
      const modelName = router.query.model;
      if (modelName && isViewerReady && localModels.length > 0) {
        // Evitar procesar si ya está cargado en escena o si ya está en cola de procesamiento
        const alreadyLoaded = importedModels.some(m => m?.object?.name === modelName);
        const alreadyLoading = loadingModelsRef.current.has(modelName);

        if (alreadyLoaded || alreadyLoading) {
          console.log(`ℹ️ Modelo "${modelName}" ya está cargado o cargándose. Omitiendo duplicado.`);
          // Limpiar el parámetro de la URL para evitar bucles
          const { model, ...restQuery } = router.query;
          router.replace({ pathname: router.pathname, query: restQuery }, undefined, { shallow: true });
          return;
        }

        const modelToLoad = localModels.find(m => m.name === modelName);

        if (modelToLoad) {
          try {
            loadingModelsRef.current.add(modelName);
            console.log(`🚀 Cargando modelo local solicitado: ${modelName}`);
            const file = await getFileFromHandle(modelToLoad.handle);
            await processFile(file, { onFragGenerated: saveFrag });
          } catch (error) {
            console.error("Error cargando modelo desde URL:", error);
          } finally {
            loadingModelsRef.current.delete(modelName);
            // Limpiar parámetro de la URL
            const { model, ...restQuery } = router.query;
            router.replace({ pathname: router.pathname, query: restQuery }, undefined, { shallow: true });
          }
        }
      }
    };
    loadModelFromUrl();
  }, [router.query.model, isViewerReady, localModels, getFileFromHandle, processFile, router, importedModels, saveFrag]);

  // Evitar que la selección interfiera con otras herramientas
  useEffect(() => {
    if (highlighterRef.current) {
      highlighterRef.current.enabled = !showInfoCoordenada;
      if (showInfoCoordenada) highlighterRef.current.clear("select");
    }
  }, [showInfoCoordenada]);

  // Temporizador para distinguir entre click simple y doble click
  const clickTimerRef = useRef(null);

  const handleSceneClick = () => {
    if (enabled) {
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current);
        clickTimerRef.current = null;
        return;
      }
      clickTimerRef.current = setTimeout(() => {
        runSelection();
        clickTimerRef.current = null;
      }, 250);
    } else {
      runSelection();
    }
  };

  const runSelection = () => {
    if (showInfoCoordenada) pickVertex();
    else pickEntity();
  };

  const handlePointerDown = (e) => {
    clickPosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e) => {
    const moveThreshold = 5;
    const deltaX = Math.abs(e.clientX - clickPosRef.current.x);
    const deltaY = Math.abs(e.clientY - clickPosRef.current.y);
    if (deltaX < moveThreshold && deltaY < moveThreshold) handleSceneClick();
  };

  // ── Drawer de usuario ─────────────────────────────────────────────────────
  const userDrawer = (
    <Box
      sx={{
        width: 280,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#1F3A5F',
      }}
      role="presentation"
    >
      {/* Cabecera con avatar */}
      <Box sx={{ p: 2, pt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Avatar sx={{ bgcolor: '#4CAF50', width: 56, height: 56, fontSize: '1.5rem', fontWeight: 'bold' }}>
          {user.displayName?.[0] || user.email[0].toUpperCase()}
        </Avatar>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 'bold', lineHeight: 1.2 }}>
            {user.displayName || 'Usuario'}
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.72rem' }}>
            {user.email}
          </Typography>
        </Box>
      </Box>

      {/* Acciones */}
      <Box sx={{ flex: 1, p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<DashboardIcon />}
          onClick={() => { setDrawerOpen(false); router.push('/dashboard'); }}
          sx={{
            color: 'white',
            borderColor: 'rgba(255,255,255,0.4)',
            textTransform: 'none',
            fontWeight: 'bold',
            justifyContent: 'flex-start',
            py: 1.2,
            '&:hover': { bgcolor: 'rgba(255,255,255,0.08)', borderColor: 'white' }
          }}
        >
          Ir al Dashboard
        </Button>
      </Box>

      {/* Pie con logout */}
      <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={logoutLoading ? <CircularProgress size={18} color="inherit" /> : <LogoutIcon />}
          onClick={handleLogout}
          disabled={logoutLoading}
          sx={{
            color: '#FF6B6B',
            borderColor: 'rgba(255,107,107,0.5)',
            textTransform: 'none',
            fontWeight: 'bold',
            justifyContent: 'flex-start',
            py: 1.2,
            '&:hover': { bgcolor: 'rgba(255,107,107,0.08)', borderColor: '#FF6B6B' }
          }}
        >
          {logoutLoading ? 'Saliendo...' : 'Cerrar sesión'}
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{
      height: '100vh',
      width: '100vw',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      background: '#181818',
      paddingTop: `${APPBAR_HEIGHT}px`,
    }}>

      {/* ── AppBar superior ──────────────────────────────────────────────── */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          height: APPBAR_HEIGHT,
          bgcolor: '#1F3A5F',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          zIndex: 1300,
        }}
      >
        <Toolbar
          variant="dense"
          sx={{
            height: APPBAR_HEIGHT,
            minHeight: `${APPBAR_HEIGHT}px !important`,
            px: { xs: 1.5, sm: 2 },
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {/* Logo / marca – izquierda */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 26,
                height: 26,
                bgcolor: '#4CAF50',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '0.75rem',
                color: 'white',
                letterSpacing: '-0.5px',
              }}
            >
              BIM
            </Box>
            <Typography
              variant="subtitle1"
              sx={{
                color: 'white',
                fontWeight: 700,
                fontSize: { xs: '0.8rem', sm: '0.95rem' },
                letterSpacing: '0.3px',
                display: { xs: 'none', sm: 'block' },
              }}
            >
              Visor 3D
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {/* Derecha: avatar + hamburguesa */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar
              sx={{
                bgcolor: '#4CAF50',
                width: 30,
                height: 30,
                fontSize: '0.8rem',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
              onClick={() => setDrawerOpen(true)}
            >
              {user.displayName?.[0] || user.email[0].toUpperCase()}
            </Avatar>

            <Tooltip title="Menú de usuario" placement="bottom">
              <IconButton
                onClick={() => setDrawerOpen(true)}
                size="small"
                sx={{ color: 'rgba(255,255,255,0.85)', '&:hover': { color: 'white' } }}
              >
                <MenuIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* ── Drawer de usuario ────────────────────────────────────────────── */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { bgcolor: '#1F3A5F' } }}
      >
        {userDrawer}
      </Drawer>

      {/* Banner de Permiso Local */}
      {localNeedsPermission && (
        <Box sx={{
          position: 'fixed',
          top: APPBAR_HEIGHT + 10,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 2000,
          bgcolor: '#FFF4E5',
          p: 1.5,
          borderRadius: 2,
          boxShadow: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          border: '1px solid #FFD599'
        }}>
          <WarningIcon color="warning" />
          <Typography variant="body2" sx={{ color: '#663C00', fontWeight: 'bold' }}>
            Acceso al repositorio local requerido
          </Typography>
          <Button size="small" variant="contained" color="warning" onClick={localAuthorize}>
            Permitir
          </Button>
        </Box>
      )}

      {/* TabStandar siempre visible */}
      <TabStandar
        onCargarFile={openFileDialog}
        hideModel={handleToggleModelVisibility}
        onCloseBrowser={handleToggleBrowser}
        onCloseRdiManager={toggleRDIManager}
        onToggleProgressManager={toggleProgressManager}
        onToggleInfoCoordenada={handleToggleInfoCoordenada}
        pickedPoint={pickedPoint}
        onResetCamera={resetCamera}
        sectionEnabled={enabled}
        onToggleSection={handleToggleSection}
        sectionPlanes={planesList}
        browserEnabled={showBrowser}
        rdiManagerEnabled={showRDIManager}
        progressManagerEnabled={showProgressManager}
        infoCoordenadaEnabled={showInfoCoordenada}
        onToggleCategoryColor={handleToggleCategoryColor}
        categoryColorEnabled={showCategoryColor}
      />

      {/* Contenedor principal - ocupa todo el espacio restante */}
      <Box data-testid="box-contenedor-principal" sx={{
        width: "100%",
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        position: "relative"
      }}>

        {/* Escena 3D */}
        <Box data-testid="box-contenedor-UNO A"
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          sx={{
            ...STYLES.viewer,
            visibility: {
              xs: showRDIManager ? "hidden" : "visible",
              sm: "visible"
            },
            position: {
              xs: showRDIManager ? "absolute" : "static",
              sm: "relative"
            },
            zIndex: {
              xs: showRDIManager ? -1 : 1,
              sm: 1
            },
            width: {
              xs: "100%",
              sm: showRDIManager ? `calc(100% - 350px)` : "100%"
            },
            flex: { xs: "none", sm: 1 },
            cursor: showInfoCoordenada ? 'crosshair' : 'default',
            height: { xs: "100%", sm: "100%" },
            transition: "width 0.2s ease"
          }}
        >
          <input
            type="file"
            accept={VIEWER_CONFIG.fileAccept}
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileSelection}
          />

          <Browser
            open={showBrowser}
            onClose={toggleBrowser}
            listaModelos={importedModels}
            ocultarModelo={handleToggleModelVisibility}
            localModels={localModels}
            onLoadLocal={async (model) => {
              try {
                const file = await getFileFromHandle(model.handle);
                await processFile(file, { onFragGenerated: saveFrag });
              } catch (error) {
                console.error("Error al cargar modelo desde el explorador:", error);
              }
            }}
            localNeedsPermission={localNeedsPermission}
            onAuthorizeLocal={localAuthorize}
            onConnectLocal={localConnect}
          />

          <SectionManagerWindow
            open={enabled}
            onClose={toggle}
            planes={planesList}
            onDeletePlane={deletePlane}
            onTogglePlane={togglePlane}
          />



          <CoordinateInfoWindow
            open={showInfoCoordenada}
            onClose={toggleInfoCoordenada}
            point={pickedPoint}
          />

          <CategoryColorWindow
            open={showCategoryColor}
            onClose={toggleCategoryColor}
            components={componentsRef.current}
          />

          <PropertyWindow
            open={showProperties}
            onClose={toggleProperties}
            properties={selectedEntityProps}
          />

          {/* Grupo de botones flotantes */}
          <Box
            onPointerDown={(e) => e.stopPropagation()}
            onPointerUp={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            sx={{
              position: 'absolute',
              top: { xs: 'auto', sm: 16 },
              bottom: { xs: 16, sm: 'auto' },
              right: 16,
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
              gap: 2
            }}
          >
            {/* Botón HOME flotante */}
            <Tooltip title="Resetear Cámara (Home)" placement="left">
              <Fab
                color="primary"
                size="small"
                onClick={resetCamera}
                sx={{
                  bgcolor: 'rgba(31, 58, 95, 0.8)',
                  '&:hover': { bgcolor: 'rgba(31, 58, 95, 1)' }
                }}
              >
                <HomeIcon />
              </Fab>
            </Tooltip>

            {/* Botón PROPIEDADES flotante */}
            <Tooltip title="Ver Propiedades" placement="left">
              <Fab
                color="primary"
                size="small"
                onClick={handleToggleProperties}
                sx={{
                  bgcolor: showProperties ? '#4CAF50' : 'rgba(31, 58, 95, 0.8)',
                  '&:hover': { bgcolor: showProperties ? '#43A047' : 'rgba(31, 58, 95, 1)' }
                }}
              >
                <PropertyIcon />
              </Fab>
            </Tooltip>

            {/* Botón PINTADO POR AVANCE flotante */}
            <Tooltip title={showBIMColors ? "Desactivar pintado por avance" : "Activar pintado por avance"} placement="left">
              <Fab
                color="primary"
                size="small"
                onClick={toggleBIMColors}
                sx={{
                  bgcolor: showBIMColors ? '#4CAF50' : 'rgba(31, 58, 95, 0.8)',
                  '&:hover': { bgcolor: showBIMColors ? '#43A047' : 'rgba(31, 58, 95, 1)' }
                }}
              >
                <PaletteIcon />
              </Fab>
            </Tooltip>

          </Box>
        </Box>

        {/* TabTools */}
        {showRDIManager && (
          <TabTools data-testid="DOS B"
            component={componentsRef.current}
            world={worldRef.current}
            topic={topicRef.current}
            autoOpenForm={autoOpenForm}
            autoEditId={autoEditId}
            autoViewId={autoViewId}
            onFormOpened={() => {
              setAutoOpenForm(false);
              setAutoEditId(null);
              setAutoViewId(null);
            }}
            sx={{
              position: { xs: "static", sm: "absolute" },
              width: { xs: "100%", sm: "350px" },
              height: "100%",
              right: { sm: 0 },
              top: { sm: 0 },
              zIndex: 20,
              pointerEvents: "none",
            }}
            onClose={() => toggleRDIManager()}
          />
        )}

        {showProgressManager && (
          <Box
            sx={{
              position: { xs: "static", sm: "absolute" },
              width: { xs: "100%", sm: "350px" },
              height: "100%",
              right: { sm: showRDIManager ? 350 : 0 },
              top: { sm: 0 },
              zIndex: 20,
              borderLeft: { sm: '1px solid' },
              borderColor: { sm: 'divider' },
              pointerEvents: "none",
            }}
          >
            <ProgressPanel
              selectedGuid={selectedGuid}
              selectedElementType={selectedElementType}
              onHighlightByGuids={handleHighlightByGuids}
              onClose={toggleProgressManager}
              showBIMColors={showBIMColors}
              onApplyBIMColors={bimColors.applyAllGroups}
              onClearBIMColors={bimColors.clearAll}
              bimDataRef={bimDataRef}
            />
          </Box>
        )}
      </Box>
      <Backdrop
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(6px)'
        }}
        open={!isViewerReady && !processing}
      >
        <CircularProgress size={50} sx={{ color: '#38bdf8' }} />
        <Typography variant="h6" sx={{ color: '#f8fafc', fontWeight: '500' }}>
          Inicializando visor 3D...
        </Typography>
        <Typography variant="body2" sx={{ color: '#94a3b8' }}>
          Preparando el entorno de visualización.
        </Typography>
      </Backdrop>

      <Backdrop
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(6px)'
        }}
        open={processing}
      >
        <CircularProgress size={50} sx={{ color: '#38bdf8' }} />
        <Typography variant="h6" sx={{ color: '#f8fafc', fontWeight: '500' }}>
          Procesando y convirtiendo modelo...
        </Typography>
        <Typography variant="body2" sx={{ color: '#94a3b8' }}>
          Por favor espere mientras cargamos la geometría 3D.
        </Typography>
      </Backdrop>
    </Box>
  );
}