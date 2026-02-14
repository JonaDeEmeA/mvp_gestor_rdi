"use client";
import { useEffect, useRef } from 'react';
import { Box, Typography } from '@mui/material';

import TabStandar from "@/componentes/TabStandar";
import Browser from "@/componentes/Browser";
import TabTools from "@/componentes/TabTools";

// Hooks personalizados
import { useViewer3D } from '../hooks/useViewer3D';
import { useViewerState } from '../hooks/useViewerState';
import { useVertexPicker } from '@/hooks/useVertexPicker';
import { useFileProcessor } from '../hooks/useFileProcessor';
import { useSection } from '@/hooks/useSection';
import SectionManagerWindow from '@/componentes/SectionManagerWindow';
import CoordinateInfoWindow from '@/componentes/CoordinateInfoWindow';

// Constantes
import { STYLES, VIEWER_CONFIG } from '../constants/viewerConfig';
import React from 'react';

export default function Home() {
  // Hooks personalizados
  const {
    containerRef,
    componentsRef,
    worldRef,
    fragmentsRef,
    topicRef,
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
    isMobile,
    toggleBrowser,
    toggleRDIManager,
    showInfoCoordenada,
    toggleInfoCoordenada,
    closeFloatingWindows,
    createToggleModelVisibility,
  } = useViewerState();

  // Hook para coordenadas
  const { pickedPoint, pickVertex } = useVertexPicker(componentsRef.current, worldRef.current);

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
          onClick={showInfoCoordenada ? pickVertex : undefined}
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
            height: { xs: "100%", sm: "85vh" },
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