"use client"

import React, { useState } from "react"
import {
  Tabs,
  Tab,
  Box,
  Button,
  Divider,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns"
import { es } from "date-fns/locale"

// Hooks personalizados
import { useIndexedDB } from "../utilitario/useIndexedDB"
import { useBCFTopics } from "../hooks/useBCFTopics"
import { useViewpoints } from "../hooks/useViewpoints"
import { useRDIForm } from "../hooks/useRDIForm"
import { useRDIManager } from "../hooks/useRDIManager"

// Componentes especializados
import TabPanel, { a11yProps } from "./TabTools/TabPanel"
import ResizablePanel from "./TabTools/ResizablePanel"
import RDIForm from "./TabTools/RDIForm"
import RDIList from "./TabTools/RDIList"
import DashboardTab from "./TabTools/DashboardTab"

export default function TabTools({ sx, exportBCF, topic, world, component }) {
  const [tabValue, setTabValue] = useState(0)
  const [filterTipo, setFilterTipo] = useState("")

  // Hooks de base de datos y BCF
  const { db, loading: dbLoading, error: dbError } = useIndexedDB()
  
  const { 
    bcfTopicSet, 
    createBCFTopic, 
    clearAllTopics 
  } = useBCFTopics(component, db)
  
  const { 
    viewpoint, 
    snapshotUrl, 
    snapShotReady, 
    createViewpoint, 
    updateSnapshot, 
    resetViewpoint,
    getSnapshotData,
    restoreSnapshot
  } = useViewpoints(component, world)

  // Hook de gestión de RDIs (nuevo sistema unificado)
  const {
    rdiList,
    loading: rdiLoading,
    error: rdiError,
    saveRDI,
    updateRDI,
    updateRDIStatus,
    clearAllRDIs,
    getRDIStats,
    exportRDIToBCF,
    exportAllRDIsToBCF,
  } = useRDIManager(db)
  
  // Hook del formulario
  const {
    formData,
    showForm,
    editId,
    isSubmitting,
    handleFormChange,
    validateForm,
    startNewForm,
    startEdit,
    cancelForm,
    resetForm,
    handleSubmit,
    getBCFTopicData,
    isEditing
  } = useRDIForm()

  // Handlers del componente principal
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
  }

  const handleAgregarRDI = () => {
    startNewForm()
    console.log('Iniciando nuevo RDI. BCF Topic Set:', bcfTopicSet)
  }

  // Manejar envío del formulario
  const handleFormAccept = async () => {
    // Obtener datos del snapshot si existe
    const snapshotData = getSnapshotData();
    
    const success = await handleSubmit(
      // Función para crear nuevo RDI
      async (rdiData) => {
        // Guardar en IndexedDB con snapshot
        const savedRDI = await saveRDI(rdiData, snapshotData)
        
        // Crear topic BCF si es necesario
        /*if (savedRDI) {
          const bcfTopicData = getBCFTopicData()
          const topic = await createBCFTopic(bcfTopicData, viewpoint)
          console.log('Topic BCF creado:', topic)
        }*/
        
        return savedRDI
      },
      // Función para actualizar RDI existente
      async (id, rdiData) => {
        // Actualizar en IndexedDB con snapshot
        const updatedRDI = await updateRDI(id, rdiData, snapshotData)
        
        // Actualizar topic BCF si es necesario
        if (updatedRDI) {
          const bcfTopicData = getBCFTopicData()
          const topic = await createBCFTopic(bcfTopicData, viewpoint, id)
          console.log('Topic BCF actualizado:', topic)
        }
        
        return updatedRDI
      }
    )

    if (success) {
      resetViewpoint()
      console.log('RDI guardado exitosamente con snapshot:', snapshotData ? 'Sí' : 'No')
    }
  }

  const handleFormCancel = () => {
    cancelForm()
    resetViewpoint()
  }

  const handleEditRDI = (item) => {
    console.log('Editando RDI:', item)
    startEdit(item)
    
    // Restaurar snapshot si existe
    if (item.snapshot) {
      console.log('Restaurando snapshot para RDI:', item.id)
      restoreSnapshot(item.snapshot)
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

  const handleInfoClick = (rdi) => {
    console.log('Información del RDI:', rdi)
    // Aquí puedes implementar un modal o drawer con información detallada
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
    return filterTipo
      ? rdiList.filter((rdi) => rdi.types === filterTipo)
      : rdiList
  }
  console.log(showForm, 'showForm');
  
  // Mostrar loading si los datos no están listos
  const isLoading = dbLoading || rdiLoading || !bcfTopicSet.labels
  const hasError = dbError || rdiError

  if (isLoading) {
    return (
      <ResizablePanel sx={sx}>
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
      </ResizablePanel>
    )
  }

  if (hasError) {
    return (
      <ResizablePanel sx={sx}>
        <Box sx={{ p: 2 }}>
          <Alert severity="error">
            Error: {hasError.message || 'Error desconocido'}
          </Alert>
        </Box>
      </ResizablePanel>
    )
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <ResizablePanel sx={sx}>
        {/* Tabs Header */}
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab label={`RDI (${rdiList.length})`} {...a11yProps(0)} />
          <Tab label="DASHBOARD" {...a11yProps(1)} />
        </Tabs>

        {/* Panel de RDI */}
        <TabPanel value={tabValue} index={0} sx={{ overflowY: "auto" }}>
          <Box sx={{ 
            height: "100%", 
            display: "flex", 
            flexDirection: "column", 
            overflowY: "auto" 
          }}>
            
            {/* Botón principal de acción */}
            {!showForm && (
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleAgregarRDI} 
                sx={{ mb: 2 }} 
                fullWidth
              >
                AGREGAR RDI
              </Button>
            
            )}

            <Divider sx={{ mb: 2 }} />

            {/* Formulario RDI */}
            <RDIForm
              showForm={showForm}
              formData={formData}
              onFormChange={handleFormChange}
              onAccept={handleFormAccept}
              onCancel={handleFormCancel}
              bcfTopicSet={bcfTopicSet}
              isEditing={isEditing}
              isSubmitting={isSubmitting}
              snapshotUrl={snapshotUrl}
              snapShotReady={snapShotReady}
              onCreateViewpoint={createViewpoint}
              onUpdateSnapshot={updateSnapshot}
            />

            {/* Lista de RDIs */}
            {!showForm && (
              <RDIList
                rdiList={getFilteredRDIList()}
                filterTipo={filterTipo}
                onFilterChange={setFilterTipo}
                onEdit={handleEditRDI}
                onStatusChange={handleStatusChange}
                onInfo={handleInfoClick}
                onExportToBCF={handleExportRDIToBCF}
                bcfTopicSet={bcfTopicSet}
                totalCount={rdiList.length}
              />
            )}

            {/* Botones de acción masiva */}
            {!showForm && rdiList.length > 0 && (
              <Box sx={{ mt: 2, display: 'flex', gap: 1, flexDirection: 'column' }}>
                <Button 
                  variant="contained" 
                  color="success" 
                  onClick={handleExportAllRDIsToBCF} 
                  fullWidth
                >
                  EXPORTAR TODOS A BCF ({rdiList.length})
                </Button>
                <Button 
                  variant="contained" 
                  color="warning" 
                  onClick={handleClearAllRDIs} 
                  fullWidth
                >
                  ELIMINAR TODOS LOS RDIs
                </Button>
              </Box>
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
      </ResizablePanel>
    </LocalizationProvider>
  )
}