"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import {
  Paper,
  Tabs,
  Tab,
  Box,
  Button,
  Divider,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Collapse,
  List,
  ListItem,
  ListItemText,
  Typography,
  IconButton,
} from "@mui/material"
import EditIcon from "@mui/icons-material/Edit"
import InfoIcon from "@mui/icons-material/Info"
import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns"
import { es } from "date-fns/locale"

import * as OBC from "@thatopen/components";

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
      style={{ height: "100%" }}
    >
      {value === index && <Box sx={{ p: 2, height: "100%" }}>{children}</Box>}
    </div>
  )
}

export default function TabTools({ sx, exportBCF, topic, world, component }) {
  const [tabValue, setTabValue] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    tipo: "",
    titulo: "",
    descripcion: "",
    comentario: "",
    fecha: null,
    estado: "",
    especialidad: "",
  })
  const [rdiList, setRdiList] = useState([])
  const [paperWidth, setPaperWidth] = useState(20) // Porcentaje inicial
  const [isResizing, setIsResizing] = useState(false)
  const [filterTipo, setFilterTipo] = useState("")
  const [editId, setEditId] = useState(null)

  const [topics, setTopics] = useState([]); // Estado para almacenar los temas BCF
  const containerRef = useRef(null)
  const resizerRef = useRef(null)

  const topicRef = useRef(null)
  const topicSetupRef = useRef(null)  

  useEffect(() => {

    const bcfTopics = component.get(OBC.BCFTopics);

    bcfTopics.setup({
      author: "signed.user@mail.com",
      types: new Set([...bcfTopics.config.types, "Información", "Coordinación", "Interferencia"]),
      statuses: new Set(["Resuelto", "Pendiente", "En revision"]),
      labels: new Set(["Arquitectura", "Calculo", "Electricidad", "Sanitario", "Climatización"]),
      users: new Set(["juan.hoyos4@gmail.com"]),
      version: "3",
    });

    const topic = bcfTopics.create({
      title: "Información faltante",
      description: "Estos elementos parecen estar mal definidos.",
      dueDate: new Date("2025-08-01"),
      type: "Clash",
      priority: "Major",
      status: "Active",
      creationDate: new Date(),
      assignedTo: "juan.hoyos@thatopen.com",
    });

    topic.createComment("¿Qué tal si hablamos de esto en la próxima reunión?");
    topic.createComment("¡De acuerdo! Lo revisamos.");

    // Crear un viewpoint después de inicializar la escena
    const viewpoints = component.get(OBC.Viewpoints);
    viewpoints.world = world;


    // Listener para nuevos topics  
    bcfTopics.list.onItemSet.add(({ value: topic }) => {
      setTopics(prev => [...prev, topic]);
    });

    topicRef.current = topic;
    topicSetupRef.current = bcfTopics;
    
    


  }, []);
  console.log( "test");

//const configuredStatuses = topicSetupRef.current.config.statuses;

  // Creación fuera de useEffect (en handlers)  
  const handleCreateViewpoint = async () => {
    const viewpoints = component.get(OBC.Viewpoints);
    const viewpoint = viewpoints.create();
    await viewpoint.updateCamera();
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
  }

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleAgregarRDI = () => {
    setShowForm(true)
    setEditId(null)
    setFormData({
      tipo: "",
      titulo: "",
      descripcion: "",
      comentario: "",
      fecha: null,
      estado: "",
      especialidad: "",
    })
    console.log(topicSetupRef.current.config.types);

  }

  const handleAceptar = () => {
    if (formData.tipo && formData.titulo && formData.comentario && formData.fecha && formData.estado) {
      if (editId !== null) {
        // Editar existente
        setRdiList((prev) =>
          prev.map((item) =>
            item.id === editId
              ? {
                ...item,
                ...formData,
                fecha: formData.fecha.toLocaleDateString("es-ES"),
              }
              : item
          )
        )
      } else {
        // Nuevo
        const newRDI = {
          ...formData,
          id: Date.now(),
          fecha: formData.fecha.toLocaleDateString("es-ES"),
        }
        setRdiList((prev) => [...prev, newRDI])
      }

      // Limpiar formulario
      setFormData({
        tipo: "",
        titulo: "",
        descripcion: "",
        comentario: "",
        fecha: null,
        estado: "",
        especialidad: "",
      })
      setEditId(null)
      setShowForm(false)
    }
  }

  const handleCancelar = () => {
    setFormData({
      tipo: "",
      titulo: "",
      descripcion: "",
      comentario: "",
      fecha: null,
      estado: "",
      especialidad: "",
    })
    setEditId(null)
    setShowForm(false)
  }

  const handleEdit = (item) => {
    setFormData({
      tipo: item.tipo,
      titulo: item.titulo,
      descripcion: item.descripcion,
      comentario: item.comentario,
      fecha: parseDateFromString(item.fecha),
      estado: item.estado,
      especialidad: item.especialidad,

    })
    setEditId(item.id)
    setShowForm(true)
  }

  // Helper para convertir "dd/mm/yyyy" a Date
  function parseDateFromString(dateStr) {
    if (!dateStr) return null
    const [day, month, year] = dateStr.split("/")
    return new Date(Number(year), Number(month) - 1, Number(day))
  }

  const handleMouseDown = useCallback((e) => {
    setIsResizing(true)
    e.preventDefault()
  }, [])

  const handleMouseMove = useCallback(
    (e) => {
      if (!isResizing || !containerRef.current) return

      const containerRect = containerRef.current.getBoundingClientRect()
      const newWidth = ((containerRect.right - e.clientX) / containerRect.width) * 100

      // Establecer límites mínimos y máximos
      const minWidth = 20 // 20% mínimo
      const maxWidth = 80 // 60% máximo

      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setPaperWidth(newWidth)
      }
    },
    [isResizing],
  )

  const handleMouseUp = useCallback(() => {
    setIsResizing(false)
  }, [])



  useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      document.body.style.cursor = "col-resize"
      document.body.style.userSelect = "none"
    } else {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
    }
  }, [isResizing, handleMouseMove, handleMouseUp])

  const tiposRDI = [
    { value: "investigacion", label: "Investigación" },
    { value: "desarrollo", label: "Desarrollo" },
    { value: "innovacion", label: "Innovación" },
    { value: "proyecto", label: "Proyecto" },
    { value: "entrega", label: "Entrega" },
  ]
  const tipoDeEstado = [
    { value: "no resuelto", label: "No Resuelto" },
    { value: "resuelto", label: "Resuelto" },
    { value: "pendiente", label: "Pendiente" }
  ]

  // Filtrar la lista según el filtro seleccionado
  const filteredRdiList = filterTipo
    ? rdiList.filter((rdi) => rdi.tipo === filterTipo)
    : rdiList

  // Handler para actualizar el estado de un item desde el selector en la lista
  const handleEstadoChangeInList = (id, newEstado) => {
    setRdiList((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, estado: newEstado }
          : item
      )
    )
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Box
        ref={containerRef}
        sx={{
          ...sx,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            minWidth: { xs: "100%", sm: "400px" },
            width: `${paperWidth}%`,
            height: "90%",
            display: "flex",
            flexDirection: "column",
            position: "absolute",
            right: 0,
            top: { xs: "100%", sm: "20%" },
            pointerEvents: "auto",
            transition: isResizing ? "none" : "width 0.2s ease",
          }}
        >
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{ borderBottom: 1, borderColor: "divider" }}
          >
            <Tab label="RDI" />
            <Tab label="DASHBOARD" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
              {/* Botón Agregar RDI */}
              <Button variant="contained" color="primary" onClick={handleAgregarRDI} sx={{ mb: 2 }} fullWidth>
                AGREGAR RDI
              </Button>

              {/* Línea divisoria */}
              <Divider sx={{ mb: 2 }} />

              {/* Formulario con transición Collapse */}
              <Collapse in={showForm}>
                <Box sx={{ mb: 3, p: 2, border: "1px solid #e0e0e0", borderRadius: 1 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    {editId !== null ? "Editar RDI" : "Nuevo RDI"}
                  </Typography>
                  {/* Input titulo */}
                  <TextField
                    fullWidth
                    label="Título"
                    value={formData.titulo}
                    onChange={(e) => handleFormChange("titulo", e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  {/* Select de tipo */}
                  <FormControl fullWidth sx={{ mb: 2 }}>

                    <InputLabel>Tipo</InputLabel>
                    <Select
                      value={formData.tipo}
                      label="Tipo"
                      onChange={(e) => handleFormChange("tipo", e.target.value)}
                    >
                      {tiposRDI.map((tipo) => (
                        <MenuItem key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Select de Asignar a */}
                  <FormControl fullWidth sx={{ mb: 2 }}>

                    <InputLabel>Especialidad</InputLabel>
                    <Select
                      value={formData.tipo}
                      label="especialidad"
                      onChange={(e) => handleFormChange("especialidad", e.target.value)}
                    >
                      {tiposRDI.map((tipo) => (
                        <MenuItem key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Estado</InputLabel>
                    <Select
                      value={formData.estado}
                      label="Estado"
                      onChange={(e) => handleFormChange("estado", e.target.value)}
                    >
                      {tipoDeEstado.map((estado) => (
                        <MenuItem key={estado.value} value={estado.value}>
                          {estado.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Input comentario */}
                  <TextField
                    fullWidth
                    label="Descripción"
                    multiline
                    rows={3}
                    value={formData.descripcion}
                    onChange={(e) => handleFormChange("descripcion", e.target.value)}
                    sx={{ mb: 2 }}
                  />


                  {/* DatePicker */}
                  <DatePicker
                    label="Fecha"
                    value={formData.fecha}
                    onChange={(newValue) => handleFormChange("fecha", newValue)}
                    renderInput={(params) => <TextField {...params} fullWidth sx={{ mb: 2 }} />}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        sx: { mb: 2 },
                      },
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Comentario"
                    multiline
                    rows={3}
                    value={formData.comentario}
                    onChange={(e) => handleFormChange("comentario", e.target.value)}
                    sx={{ mb: 2 }}
                  />

                  {/* Botones */}
                  <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                    <Button variant="outlined" onClick={handleCancelar}>
                      CANCELAR
                    </Button>
                    <Button variant="contained" onClick={handleAceptar}>
                      {editId !== null ? "GUARDAR" : "ACEPTAR"}
                    </Button>
                  </Box>
                </Box>
              </Collapse>

              {/* Lista de RDIs */}
              <Box sx={{ flex: 1, overflow: "auto" }}>
                {rdiList.length > 0 && (
                  <>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      Lista de RDIs
                    </Typography>
                    {/* Selector de filtro */}
                    <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                      <InputLabel>Filtrar por tipo</InputLabel>
                      <Select
                        value={filterTipo}
                        label="Filtrar por tipo"
                        onChange={(e) => setFilterTipo(e.target.value)}
                      >
                        <MenuItem value="">Todos</MenuItem>
                        {tiposRDI.map((tipo) => (
                          <MenuItem key={tipo.value} value={tipo.value}>
                            {tipo.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <List>
                      {filteredRdiList.map((rdi) => (
                        <ListItem
                          key={rdi.id}
                          divider
                          secondaryAction={
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              {/* Selector editable de estado */}
                              <FormControl size="small" sx={{ minWidth: 120, mr: 1 }}>
                                <InputLabel>Estado</InputLabel>
                                <Select
                                  value={rdi.estado || ""}
                                  label="Estado"
                                  onChange={(e) => handleEstadoChangeInList(rdi.id, e.target.value)}
                                >
                                  {tipoDeEstado.map((estado) => (
                                    <MenuItem key={estado.value} value={estado.value}>
                                      {estado.label}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                              <IconButton
                                edge="end"
                                aria-label="info"
                                onClick={() => console.log("boton clickeado")}
                                size="small"
                              >
                                <InfoIcon />
                              </IconButton>
                              <IconButton
                                edge="end"
                                aria-label="edit"
                                onClick={() => handleEdit(rdi)}
                                size="small"
                                sx={{ ml: 1 }}
                              >
                                <EditIcon />
                              </IconButton>
                            </Box>
                          }
                        >
                          <ListItemText
                            primary={rdi.nombre}
                            secondary={
                              <Box>
                                <Typography variant="body2" color="text.secondary" component="span">
                                  <strong>Tipo:</strong> {tiposRDI.find((t) => t.value === rdi.tipo)?.label}
                                </Typography>
                                <br />
                                <Typography variant="body2" color="text.secondary" component="span">
                                  <strong>Comentario:</strong> {rdi.comentario}
                                </Typography>
                                <br />
                                <Typography variant="body2" color="text.secondary" component="span">
                                  <strong>Fecha:</strong> {rdi.fecha}
                                </Typography>
                                <br />
                                <Typography variant="body2" color="text.secondary" component="span">
                                  <strong>Estado:</strong> {rdi.estado}
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}
              </Box>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Typography variant="h6" color="text.secondary">
                Contenido del Dashboard
              </Typography>
            </Box>
          </TabPanel>

          {/* Handle de redimensionamiento */}
          <Box
            ref={resizerRef}
            onMouseDown={handleMouseDown}
            sx={{
              position: "absolute",
              top: 0,
              left: -2,
              width: 4,
              height: "100%",
              cursor: "col-resize",
              backgroundColor: "transparent",
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
    </LocalizationProvider>
  )
}