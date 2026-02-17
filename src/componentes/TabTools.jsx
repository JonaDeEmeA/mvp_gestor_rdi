"use client"

import React, { useEffect, useState } from "react"
import {
  Tabs,
  Tab,
  Box,
  Button,
  Divider,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns"
import { es } from "date-fns/locale"

// Hooks personalizados
import { useIndexedDB } from "../utilitario/useIndexedDB"
import { useViewpoints } from "../hooks/useViewpoints"
import { useRDIForm } from "../hooks/useRDIForm"
import { useRDIManager } from "../hooks/useRDIManager"
import { useBCFTopics } from "../hooks/useBCFTopics"
import { useResizable } from "../hooks/useResizable"

// Componentes especializados
import TabPanel, { a11yProps } from "./TabTools/TabPanel"
import RDIForm from "./TabTools/RDIForm"
import RDIView from "./TabTools/RDIView"
import RDIList from "./TabTools/RDIList"
import DashboardTab from "./TabTools/DashboardTab"
import { HeaderSection, ContentSection, FooterSection } from './TabTools/LayoutSections';
import RDIHeader from './TabTools/RDIHeader';
import RDIFooter from './TabTools/RDIFooter';
import CloseButton from './CloseButton';

// Componente para el panel lateral de edición
const EditPanel = ({
  children,
  show,
  onClose,
  initialWidth = 30,
  minWidth = 25,
  maxWidth = 70,
  rdi,
  headerTitle,
  headerActions,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const {
    width: panelWidth,
    isResizing,
    containerRef,
    handleMouseDown
  } = useResizable(initialWidth, minWidth, maxWidth, 'left');

  if (!show) return null;

  return (
    <Box
      ref={containerRef}
      sx={{
        // En desktop es un panel flotante, en móvil es un bloque normal
        position: { xs: 'relative', sm: 'absolute' },
        left: { xs: 'auto', sm: 0 },
        top: { xs: 'auto', sm: 0 },
        height: { xs: 'auto', sm: '100%' },
        width: {
          xs: '100%', // En móviles ocupa toda la pantalla
          sm: `${panelWidth}%` // En desktop usa el ancho redimensionable
        },
        // El zIndex solo es necesario en desktop
        zIndex: { xs: 'auto', sm: 1300 },
        pointerEvents: 'auto',
        transition: isResizing ? "none" : "width 0.2s ease",
      }}
    >
      <Paper
        elevation={8}
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header del panel */}
        <Box sx={{
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Typography variant="h6">{headerTitle}</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>{headerActions}</Box>
        </Box>

        {/* Contenido del panel */}
        <Box sx={{
          flex: 1,
          overflow: 'auto',
          p: 2
        }}>
          {children}
        </Box>

        {/* Handle de redimensionamiento - solo en desktop */}
        <Box
          onMouseDown={handleMouseDown}
          sx={{
            position: "absolute",
            top: 0,
            right: -2,
            width: 4,
            height: "100%",
            cursor: "col-resize",
            backgroundColor: "transparent",
            display: { xs: "none", sm: "block" }, // Ocultar en móviles
            "&:hover": {
              backgroundColor: "primary.main",
              opacity: 0.3,
            },
            "&:active": {
              backgroundColor: "primary.main",
              opacity: 0.5,
            },
            zIndex: 1000,
          }}
        />
      </Paper>

      {/* Overlay durante el redimensionamiento */}
      {isResizing && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            cursor: "col-resize",
          }}
        />
      )}
    </Box>
  );
};

export default function TabTools({ sx, topic, world, component, onClose }) {
  const [tabValue, setTabValue] = useState(0)
  const [filterTipo, setFilterTipo] = useState("")
  const [filterEstado, setFilterEstado] = useState("")
  const [showEditPanel, setShowEditPanel] = useState(false)
  const [editPanelMode, setEditPanelMode] = useState('view'); // 'view' o 'edit'
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Detectar dispositivos móviles
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Hooks de base de datos y BCF
  const { db, loading: dbLoading, error: dbError } = useIndexedDB()
  const { bcfTopicSet, createBCFTopic, clearAllTopics, importBCF, exportBCF, exportBCFWithCorrectXML } = useBCFTopics(component, db);

  // Hooks para el formulario de AGREGAR
  const addFormLogic = useRDIForm();
  const addViewpointsLogic = useViewpoints(component, world);

  // Hooks para el formulario de EDITAR
  const editFormLogic = useRDIForm();
  const editViewpointsLogic = useViewpoints(component, world);

  // La función para actualizar la cámara es independiente del estado del hook
  //const { updateCameraFromViewpoint } = addViewpointsLogic;

  const {
    viewpoint,
    viewpointsRef,
    snapshotUrl,
    snapShotReady,
    createViewpoint,
    updateSnapshot,
    resetViewpoint,
    getSnapshotData,
    restoreSnapshot,
    updateCameraFromViewpoint
  } = useViewpoints(component, world)

  // Hook de gestión de RDIs (nuevo sistema unificado)
  const {
    rdiList,
    loading: rdiLoading,
    error: rdiError,
    getRDIByIdFromDB,
    saveRDI,
    updateRDI,
    deleteRDI,
    updateRDIStatus,
    clearAllRDIs,
    getRDIStats,
    getRDIById,
    convertRDIToBCFTopic,
    exportRDIToBCF,
    exportAllRDIsToBCF,
  } = useRDIManager(db);

  // Handlers del componente principal
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
  }

  // Handler para cerrar TabTools
  const handleClose = () => {
    console.log('🚪 PASO 5.2: Ejecutando handleClose');

    // Verificar si hay formulario sin guardar
    if (addFormLogic.showForm && addFormLogic.formData.titulo) {
      const confirmClose = window.confirm(
        '¿Estás seguro de cerrar? Hay cambios sin guardar que se perderán.'
      );

      if (!confirmClose) {
        console.log('❌ Cierre cancelado');
        return;
      }
    }

    // Limpiar estado
    addFormLogic.cancelForm();
    addViewpointsLogic.resetViewpoint();

    if (showEditPanel) {
      setShowEditPanel(false);
      setEditingItem(null);
      editFormLogic.cancelForm();
      editViewpointsLogic.resetViewpoint();
    }

    // Llamar a la función de cierre del padre
    if (typeof onClose === 'function') {
      console.log('✅ Llamando a onClose del padre');
      onClose();
    } else {
      console.warn('⚠️  onClose no es una función válida');
    }
  };

  const handleAgregarRDI = () => {
    //startNewForm()
    addFormLogic.startNewForm();
    addViewpointsLogic.resetViewpoint();
    // Opcional: cerrar el panel de edición si está abierto para evitar confusiones
    /*if (showEditPanel) {
      setShowEditPanel(false);
      setEditingItem(null);
    }*/
    console.log('Iniciando nuevo RDI. BCF Topic Set:', bcfTopicSet)
  }

  // Manejar envío del formulario
  const handleAddFormAccept = async () => {
    // Obtener datos del snapshot si existe

    const snapshotData = addViewpointsLogic.getSnapshotData();
    // Función para crear nuevo RDI
    const success = await addFormLogic.handleSubmit(
      async (rdiData) => {
        // Guardar en IndexedDB con snapshot
        const savedRDI = await saveRDI(rdiData, snapshotData)

        return savedRDI
      },
      // Función para actualizar RDI existente


      () => Promise.resolve() // No se usa para agregar
    );

    if (success) {

      addViewpointsLogic.resetViewpoint();
      console.log('RDI guardado exitosamente con snapshot:', snapshotData ? 'Sí' : 'No')
    }
  }



  const handleAddFormCancel = () => {
    addFormLogic.cancelForm();
    addViewpointsLogic.resetViewpoint();
  };

  const handleEditFormAccept = async () => {
    const snapshotData = editViewpointsLogic.getSnapshotData();
    const success = await editFormLogic.handleSubmit(
      () => Promise.resolve(), // No se usa para editar
      async (id, rdiData) => {
        // updateRDI ahora debería devolver el item actualizado
        const updatedItem = await updateRDI(id, rdiData, snapshotData);
        // Actualizamos el item que se está viendo en el panel
        if (updatedItem) {
          setEditingItem(updatedItem);
        }
      }
    );
    if (success) {
      setEditPanelMode('view'); // En lugar de cerrar, volvemos al modo vista
    }
  };

  // Nuevo handler para cancelar solo la edición y volver a la vista
  const handleCancelEdit = () => {
    setEditPanelMode('view');
    // Opcional: Restaurar los datos originales por si se hicieron cambios
    if (editingItem) editFormLogic.startEdit(editingItem);
  };

  const handleCloseEditPanel = () => {
    // Si estamos en modo edición y hay cambios, mostrar confirmación
    if (editPanelMode === 'edit' && editFormLogic.hasChanges) {
      setShowConfirmDialog(true);
      return;
    }
    // Si no, cerrar directamente
    setShowEditPanel(false);
    setEditingItem(null);
    editFormLogic.cancelForm();
    editViewpointsLogic.resetViewpoint();
    setEditPanelMode('view'); // Resetear modo
  };

  const handleConfirmClose = () => {
    setShowConfirmDialog(false);
    setShowEditPanel(false);
    setEditingItem(null);
    editFormLogic.cancelForm();
    editViewpointsLogic.resetViewpoint();
    setEditPanelMode('view');
  };

  const onVerSnapshotPV = () => {
    if (!editingItem || !editingItem.snapshot || !editingItem.snapshot.viewpointData) {
      console.warn('No hay datos de snapshot disponibles para este RDI.');
      return;
    }

    console.log("VER...", editingItem.id);
    updateCameraFromViewpoint(editingItem.snapshot.viewpointData);
  }

  const handleEditRDI = (item) => {
    //updateCameraFromViewpoint(item.snapshot.viewpointData)
    console.log('Editando RDI:', item)

    // Mostrar panel de edición lateral
    setEditingItem(item);
    setShowEditPanel(true)
    setEditPanelMode('view'); // Iniciar siempre en modo vista
    editFormLogic.startEdit(item)

    //startEdit(item)

    // Restaurar snapshot si existe
    if (item.snapshot) {
      console.log('Restaurando snapshot para RDI:', item.id)
      //restoreSnapshot(item.snapshot)
      editViewpointsLogic.restoreSnapshot(item.snapshot)
    } else {
      console.log('No hay snapshot para restaurar en RDI:', item.id)
    }
  }

  const handleStatusChange = async (id, newStatus) => {
    try {
      console.log('Actualizando estado del RDI:', id, 'a:', newStatus)
      await updateRDIStatus(id, newStatus)
      console.log('Estado actualizado exitosamente')
    } catch (error) {
      console.error('Error actualizando estado:', error)
    }
  }

  const handleDeleteRDI = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este RDI?')) {
      try {
        await deleteRDI(id);
        console.log('RDI eliminado exitosamente');
      } catch (error) {
        console.error('Error eliminando RDI:', error);
      }
    }
  }

  const handleClearAllRDIs = async () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar todos los RDIs?')) {
      try {
        await clearAllRDIs()
        await clearAllTopics()
        console.log('Todos los RDIs eliminados')
      } catch (error) {
        console.error('Error eliminando RDIs:', error)
      }
    }
  }

  // Handler para exportar RDI individual a BCF
  const handleExportRDIToBCF = async (rdiId) => {
    try {
      console.log('Exportando RDI a BCF:', rdiId)
      await exportRDIToBCF(rdiId)
      console.log('RDI exportado exitosamente')
    } catch (error) {
      console.error('Error exportando RDI:', error)
      alert('Error al exportar RDI: ' + error.message)
    }
  }

  // Este handler ahora se encarga de todo el proceso de exportación
  const handleExportToBCF = async (rdiId) => {
    try {
      // 1. Obtener datos desde IndexedDB
      const rdiData = await getRDIByIdFromDB(rdiId);
      if (!rdiData) {
        console.error(`RDI con ID ${rdiId} no encontrado`);
        return;
      }
      // 2. Crear el objeto BCF Topic (incluyendo viewpoint si existe)
      const topic = await createBCFTopic(rdiData, rdiData.snapshot);
      console.log('BCF Topic creado:', topic);

      // 3. Exportar el topic a un archivo .bcfzip
      if (topic) await exportBCFWithCorrectXML(topic);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Handler para exportar todos los RDIs a BCF
  const handleExportAllRDIsToBCF = async () => {
    try {
      console.log('Exportando todos los RDIs a BCF')
      await exportAllRDIsToBCF()
      console.log('Todos los RDIs exportados exitosamente')
      alert(`${rdiList.length} RDIs exportados exitosamente a formato BCF`)
    } catch (error) {
      console.error('Error exportando todos los RDIs:', error)
      alert('Error al exportar RDIs: ' + error.message)
    }
  }

  // Filtrar lista según el filtro seleccionado
  const getFilteredRDIList = () => {
    return rdiList.filter((rdi) => {
      const matchTipo = filterTipo ? (rdi.tipo || rdi.types) === filterTipo : true;
      const matchEstado = filterEstado ? (rdi.estado || rdi.statuses) === filterEstado : true;
      return matchTipo && matchEstado;
    });
  }

  // Mostrar loading si los datos no están listos
  const isLoading = dbLoading || rdiLoading || !bcfTopicSet.labels
  const hasError = dbError || rdiError

  if (isLoading) {
    return (
      <Paper sx={{ ...sx, width: { xs: '100%', sm: 350 }, p: 2 }}>
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          gap: 2
        }}>
          <CircularProgress />
          <Typography>Cargando datos...</Typography>
        </Box>
      </Paper>
    )
  }

  if (hasError) {
    return (
      <Paper sx={{ ...sx, width: { xs: '100%', sm: 350 }, p: 2 }}>
        <Box sx={{ p: 2 }}>
          <Alert severity="error">
            Error: {hasError.message || 'Error desconocido'}
          </Alert>
        </Box>
      </Paper>
    )
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      {/* Panel lateral de edición */}
      <EditPanel
        show={showEditPanel}
        // Lógica condicional para el botón de cerrar/cancelar del panel
        onClose={editPanelMode === 'edit' ? handleCancelEdit : handleCloseEditPanel}
        headerTitle={editPanelMode === 'view' ? 'Detalles del RDI' : 'Editar RDI'}
        headerActions={
          editPanelMode === 'view' ? (
            <>
              <Button variant="contained" onClick={() => setEditPanelMode('edit')}>Editar</Button>
              <Button variant="outlined" onClick={handleCloseEditPanel}>Cerrar</Button>
            </>
          ) : (
            <>
              <Button
                variant="contained"
                color="primary"
                onClick={handleEditFormAccept}
                disabled={editFormLogic.isSubmitting}
              >
                {editFormLogic.isSubmitting ? <CircularProgress size={24} /> : 'Guardar'}
              </Button>
              <Button variant="outlined" onClick={handleCancelEdit}>Cancelar</Button>
            </>
          )
        }
      >
        {editPanelMode === 'view' ? (
          <RDIView
            rdi={editingItem}
            bcfTopicSet={bcfTopicSet}
            onEdit={() => setEditPanelMode('edit')}
            onVerSnapshot={onVerSnapshotPV}
            snapshotUrl={editViewpointsLogic.snapshotUrl}
          />
        ) : (
          <RDIForm
            showForm={true}
            formData={editFormLogic.formData}
            onFormChange={editFormLogic.handleFormChange}
            onAccept={handleEditFormAccept}
            onCancel={handleCancelEdit} // <--- CAMBIO CLAVE
            bcfTopicSet={bcfTopicSet}
            isEditing={editFormLogic.isEditing}
            isSubmitting={editFormLogic.isSubmitting}
            snapshotUrl={editViewpointsLogic.snapshotUrl}
            snapShotReady={editViewpointsLogic.snapShotReady}
            onCreateViewpoint={editViewpointsLogic.createViewpoint}
            onUpdateSnapshot={editViewpointsLogic.updateSnapshot}
            onVerSnapshotPV={onVerSnapshotPV}
          />
        )}
      </EditPanel>

      {/* Diálogo de confirmación para cambios sin guardar */}
      <Dialog
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Descartar cambios"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Tienes cambios sin guardar. ¿Estás seguro de que quieres cerrar y descartarlos?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmDialog(false)}>Cancelar</Button>
          <Button onClick={handleConfirmClose} autoFocus color="warning">
            Descartar
          </Button>
        </DialogActions>
      </Dialog>

      <Paper
        elevation={3}
        sx={{
          ...sx,
          minWidth: { sm: "350px" },
          width: { xs: "100%", sm: "350px" },
          height: "100%",
          display: "flex",
          flexDirection: "column",
          pointerEvents: "auto",
          display: (isMobile && showEditPanel) ? "none" : "block",
          position: 'relative',
        }}
      >
        <CloseButton
          onClose={handleClose}
          tooltip="Cerrar gestor de RDI"
        />
        {/* Tabs Header */}
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: "divider", paddingRight: '40px' }}
        >
          <Tab label={`RDI (${rdiList.length})`} {...a11yProps(0)} />
          <Tab label="DASHBOARD" {...a11yProps(1)} />
        </Tabs>

        {/* Panel de RDI */}
        <TabPanel value={tabValue} index={0} sx={{
          overflow: 'hidden',  // ✅ PASO 6.1
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          padding: 0  // Eliminar padding del TabPanel
        }}>
          {console.log('📋 PASO 6: Renderizando TabPanel RDI con nueva estructura')}

          <Box sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            overflow: 'hidden'
          }}>

            {/* ✅ PASO 6.2: HEADER - Sección Superior Fija */}
            <RDIHeader
              showForm={addFormLogic.showForm}
              onAddRDI={handleAgregarRDI}
              onImportBCF={importBCF}
              rdiCount={rdiList.length}
            />

            {/* ✅ PASO 6.3: CONTENT - Sección Media Scrollable */}
            <ContentSection>
              {console.log('📋 PASO 6.3: Renderizando contenido principal')}

              {/* Formulario RDI */}
              {addFormLogic.showForm && (
                <Box sx={{ mb: 2 }}>
                  <RDIForm
                    showForm={addFormLogic.showForm}
                    formData={addFormLogic.formData}
                    onFormChange={addFormLogic.handleFormChange}
                    onAccept={handleAddFormAccept}
                    onCancel={handleAddFormCancel}
                    bcfTopicSet={bcfTopicSet}
                    isEditing={addFormLogic.isEditing}
                    isSubmitting={addFormLogic.isSubmitting}
                    snapshotUrl={addViewpointsLogic.snapshotUrl}
                    snapShotReady={addViewpointsLogic.snapShotReady}
                    onCreateViewpoint={addViewpointsLogic.createViewpoint}
                    onUpdateSnapshot={addViewpointsLogic.updateSnapshot}
                  />
                </Box>
              )}

              {/* Lista de RDIs */}
              {!addFormLogic.showForm && (
                <RDIList
                  rdiList={getFilteredRDIList()}
                  filterTipo={filterTipo}
                  onFilterChange={setFilterTipo}
                  filterEstado={filterEstado}
                  onFilterEstadoChange={setFilterEstado}
                  onEdit={handleEditRDI}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDeleteRDI}
                  onExportToBCF={handleExportToBCF}
                  bcfTopicSet={bcfTopicSet}
                  totalCount={rdiList.length}
                />
              )}
            </ContentSection>

            {/* ✅ PASO 6.4: FOOTER - Sección Inferior Fija */}
            {!addFormLogic.showForm && (
              <RDIFooter
                rdiList={rdiList}
                bcfTopicSet={bcfTopicSet}
                onExportAll={handleExportAllRDIsToBCF}
                onDeleteAll={handleClearAllRDIs}
              />
            )}
          </Box>
        </TabPanel>

        {/* Panel Dashboard */}
        <TabPanel value={tabValue} index={1}>
          <DashboardTab
            rdiList={rdiList}
            bcfTopicSet={bcfTopicSet}
            stats={getRDIStats()}
          />
        </TabPanel>
      </Paper>
    </LocalizationProvider>
  )
}