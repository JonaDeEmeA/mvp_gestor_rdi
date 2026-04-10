"use client";
import { useEffect, useRef } from 'react';
import { Box, Typography, Fab, Tooltip } from '@mui/material';
import { Home as HomeIcon } from '@mui/icons-material';

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
import { Assignment as PropertyIcon } from '@mui/icons-material';

// Constantes
import { STYLES, VIEWER_CONFIG } from '../constants/viewerConfig';
import React from 'react';

export default function Home() {
  const clickPosRef = useRef({ x: 0, y: 0 });

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
    showInfoCoordenada,
    showCategoryColor,
    showProperties,
    selectedEntityProps,
    isMobile,
    toggleBrowser,
    toggleRDIManager,
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
  const { pickEntity } = usePropertySelection(
    componentsRef.current,
    worldRef.current,
    highlighterRef.current,
    setSelectedEntityProps
  );

  const { fileInputRef, openFileDialog, handleFileSelection } = useFileProcessor(
    worldRef,
    fragmentsRef,
    setImportedModels
  );

  // Crear función de toggle de visibilidad con fragmentsRef
  const handleToggleModelVisibility = createToggleModelVisibility(fragmentsRef);

  // Manejadores locales para coordinar exclusividad con la herramienta de sección
  const handleToggleSection = () => {
    if (!enabled) {
      // Si vamos a activar sección, cerramos Browser e Info Coor
      closeFloatingWindows();
    }
    toggle();
  };

  const handleToggleBrowser = () => {
    if (!showBrowser) {
      // Si vamos a activar browser, cerramos sección
      if (enabled) toggle();
    }
    toggleBrowser();
  };

  const handleToggleInfoCoordenada = () => {
    if (!showInfoCoordenada) {
      // Si vamos a activar info coor, cerramos sección
      if (enabled) toggle();
    }
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

  // Manejador unificado de clics en la escena
  const handleSceneClick = () => {
    if (showInfoCoordenada) {
      pickVertex();
    } else {
      pickEntity();
    }
  };

  const handlePointerDown = (e) => {
    clickPosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e) => {
    // Evitar disparar selección si hubo arrastre (órbita/pan)
    const moveThreshold = 5;
    const deltaX = Math.abs(e.clientX - clickPosRef.current.x);
    const deltaY = Math.abs(e.clientY - clickPosRef.current.y);

    if (deltaX < moveThreshold && deltaY < moveThreshold) {
      handleSceneClick();
    }
  };

  return (
    <Box sx={STYLES.container}>
      {/* TabStandar siempre visible */}
      <TabStandar
        onCargarFile={openFileDialog}
        hideModel={handleToggleModelVisibility}
        onCloseBrowser={handleToggleBrowser}
        onCloseRdiManager={toggleRDIManager} // RDI Manager sigue independiente
        onToggleInfoCoordenada={handleToggleInfoCoordenada}
        pickedPoint={pickedPoint}
        onResetCamera={resetCamera}
        sectionEnabled={enabled}
        onToggleSection={handleToggleSection}
        sectionPlanes={planesList}
        browserEnabled={showBrowser}
        rdiManagerEnabled={showRDIManager}
        infoCoordenadaEnabled={showInfoCoordenada}
        onToggleCategoryColor={handleToggleCategoryColor}
        categoryColorEnabled={showCategoryColor}
      />

      {/* Contenedor principal que cambia según el estado */}
      <Box data-testid="box-contenedor-principal" sx={{
        width: "100%",
        height: { xs: "100vh", sm: "85vh" },
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },

        position: { xs: "static", sm: "relative" }
      }}>

        {/* Escena 3D - Se oculta en móviles cuando TabTools está activo */}
        <Box data-testid="box-contenedor-UNO A"
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          sx={{
            ...STYLES.viewer,
            visibility: {
              xs: showRDIManager ? "hidden" : "visible", // Ocultar en móviles si TabTools está activo
              sm: "visible" // Siempre visible en desktop
            },
            position: {
              xs: showRDIManager ? "absolute" : "static", // Posición absoluta cuando está oculto en móviles
              sm: "relative"
            },
            zIndex: {
              xs: showRDIManager ? -1 : 1, // Enviar atrás cuando está oculto en móviles
              sm: 1
            },
            // Ajustar ancho dinámicamente  
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
                  '&:hover': {
                    bgcolor: 'rgba(31, 58, 95, 1)',
                  }
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
                  '&:hover': {
                    bgcolor: showProperties ? '#43A047' : 'rgba(31, 58, 95, 1)',
                  }
                }}
              >
                <PropertyIcon />
              </Fab>
            </Tooltip>
          </Box>
        </Box>

        {/* TabTools - Ocupa toda la pantalla en móviles, panel lateral redimensionable en desktop */}
        {showRDIManager && (
          <TabTools data-testid="DOS B"
            component={componentsRef.current}
            world={worldRef.current}
            topic={topicRef.current}
            sx={{
              // Móviles: Posición estática, ocupa toda la pantalla
              position: { xs: "static", sm: "absolute" },
              width: { xs: "100%", sm: "350px" },
              height: "100%",
              // Desktop: Posición absoluta para redimensionamiento
              right: { sm: 0 },
              top: { sm: 0 },
              zIndex: 20,
              pointerEvents: "none",
            }}
            onClose={() => {
              console.log('═══════════════════════════════════════════');
              console.log('🚪 PASO 4.1: Cerrando TabTools desde viewer');
              console.log('═══════════════════════════════════════════');
              toggleRDIManager(); // Función existente del hook useViewerState
              console.log('✅ showRDIManager cambiado a false');
              console.log('═══════════════════════════════════════════');
            }}
          />
        )}
      </Box>
    </Box>
  );
}