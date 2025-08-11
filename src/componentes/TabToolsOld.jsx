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
import { es, se } from "date-fns/locale"

import * as OBC from "@thatopen/components";
import { set } from "date-fns"

import { useIndexedDB } from "../utilitario/useIndexedDB"

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
      style={{ height: "90%" }}
    >
      {value === index && <Box sx={{ p: 2, height: "100%" }}>{children}</Box>}
    </div>
  )
}

const inputStyles = {
  fontSize: '0.75rem',
  height: '32px'
}

export default function TabTools({ sx, exportBCF, topic, world, component }) {
  const [tabValue, setTabValue] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    types: "",
    titulo: "",
    descripcion: "",
    comentario: "",
    fecha: null,
    statuses: "",
    labels: "",
  })
  const [rdiList, setRdiList] = useState([])
  const [paperWidth, setPaperWidth] = useState(20) // Porcentaje inicial
  const [isResizing, setIsResizing] = useState(false)
  const [filterTipo, setFilterTipo] = useState("")
  const [editId, setEditId] = useState(null)
  const [snapShotReady, setSnapShotReady] = useState(false)
  const [viewpoint, setViewpoint] = useState(null);
  const [snapshotUrl, setSnapshotUrl] = useState(null);

  const [topicsFromDB, setTopicsFromDB] = useState([]); // Estado para almacenar los temas BCF desde IndexedDB
  const [topics, setTopics] = useState([]); // Estado para almacenar los temas BCF
  const [bcfTopicSet, setbcfTopicSet] = useState({}); // Estado para almacenar los temas BCF
  const containerRef = useRef(null)
  const resizerRef = useRef(null)
  const bcfTopicsRef = useRef(null);

  const { db, loading, error } = useIndexedDB();

  useEffect(() => {
    if (db) {
      const transaction = db.transaction(['topics'], 'readonly');
      const store = transaction.objectStore('topics');
      const request = store.getAll();

      request.onsuccess = () => {
        setTopicsFromDB(request.result);
        console.log('Datos:', request.result);
      };
    }
  }, [db]);


  useEffect(() => {

    const bcfTopics = component.get(OBC.BCFTopics);

    bcfTopics.setup({
      author: "signed.user@mail.com",
      types: new Set([...bcfTopics.config.types, "Información", "Coordinación", "Interferencia"]),
      statuses: new Set(["Resuelto", "Pendiente", "En revision"]),
      labels: new Set(["Arquitectura", "Calculo", "Electricidad", "Sanitario", "Climatización"]),
      users: new Set(["jonamorales@gmail.com", "coordinacion@gmail.com"]),
      version: "3",
    });
    // Inicializar bcfTopicsRef con la instancia de BCFTopics
    bcfTopicsRef.current = bcfTopics;

    setbcfTopicSet({
      statuses: bcfTopics.config.statuses,
      types: bcfTopics.config.types,
      labels: bcfTopics.config.labels,
      users: bcfTopics.config.users,
    })

    /*const topic = bcfTopics.create({
      title: "Información faltante",
      description: "Estos elementos parecen estar mal definidos.",
      dueDate: new Date("2025-08-01"),
      type: "Clash",
      priority: "Major",
      status: "Active",
      creationDate: new Date(),
      assignedTo: "juan.hoyos@thatopen.com",
    });*/

    //topic.createComment("¿Qué tal si hablamos de esto en la próxima reunión?");
    //topic.createComment("¡De acuerdo! Lo revisamos.");

    // Crear un viewpoint después de inicializar la escena
    const viewpoints = component.get(OBC.Viewpoints);
    viewpoints.world = world;


    // Listener para nuevos topics  
    bcfTopics.list.onItemSet.add(({ value: topic }) => {
      setTopics(prev => [...prev, topic]);
    });

    //console.log("-----", bcfTopics);




  }, []);

  const viewpoints = component.get(OBC.Viewpoints);
  // Asigna el world (escena actual)
  viewpoints.world = world;

  const snapShotRef = useRef(null);
  const viewPointRef = useRef(null);

  const createViewpoint = async () => {

    const vp = viewpoints.create();
    vp.title = "Mi Viewpoint";
    await vp.updateCamera(); // Captura posición actual de cámara
    vp.takeSnapshot(); // Toma un snapshot de la cámara
    viewPointRef.current = vp


    setViewpoint(vp);
    updateSnapshotDisplay(vp);
    //addSnapshotToDiv();             // Agrega imagen al div
    setSnapShotReady(true);
  };


  const updateSnapshot = async () => {

    if (!viewpoint) return;

    // Actualizar la cámara y esperar a que termine  
    await viewpoint.updateCamera();

    // Actualizar la visualización después de que se complete la captura  
    updateSnapshotDisplay(viewpoint);



  };

  const updateSnapshotDisplay = (vp) => {
    if (!vp || !viewpoints) return;

    // Obtener los datos del snapshot  
    const snapshotData = viewpoints.snapshots.get(vp.snapshot);
    if (snapshotData) {
      const blob = new Blob([snapshotData], { type: "image/png" });
      const url = URL.createObjectURL(blob);

      // Limpiar URL anterior para evitar memory leaks  
      if (snapshotUrl) {
        URL.revokeObjectURL(snapshotUrl);
      }

      setSnapshotUrl(url);
    }
  };

  // Limpiar URLs al desmontar el componente  
  useEffect(() => {
    return () => {
      if (snapshotUrl) {
        URL.revokeObjectURL(snapshotUrl);
      }
    };
  }, [snapshotUrl]);


  //const configuredStatuses = topicSetupRef.current.config.statuses;
  //console.log("PropNameDelOBJ",Object.getOwnPropertyNames(topicSetupRef.current) );
  //console.log("PropHeredadas",Object.getPrototypeOf(topicSetupRef.current) );
  //console.log("****", viewPointRef.current);
  // Creación fuera de useEffect (en handlers)  


  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
  }

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    console.log("Form data updated:", formData.labels)
  }

  const handleAgregarRDI = () => {
    setShowForm(true)
    setEditId(null)
    setFormData({
      types: "",
      titulo: "",
      descripcion: "",
      comentario: "",
      fecha: null,
      statuses: "",
      labels: "",
    })
    console.log(bcfTopicSet);
    console.log(formData);
    console.log("BCF Topics:", topicsFromDB);


  }

  const handleAceptar = () => {
    if (formData.types && formData.titulo && formData.fecha && formData.statuses) {
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

      let topic = null;
      // Crear topic BCF solo si la instancia está disponible
      if (bcfTopicsRef.current) {
        const topicData = {
          title: formData.titulo,
          description: formData.descripcion,
          dueDate: formData.fecha,
          type: formData.types,
          status: formData.statuses,
          labels: [formData.labels],
          // ...otros campos si es necesario...
        }


        // Si es edición, agrega el id original
        if (editId !== null) {
          topicData.id = editId;
        }

        topic = bcfTopicsRef.current.create(topicData);

        // Listener para nuevos topics  
        /*bcfTopicsRef.current.list.onItemSet.add(({ value: topic }) => {
          setTopics(prev => [...prev, topic]);
        });*/

        topic.viewpoints.add(viewpoint.guid);

        // GUARDAR EN INDEXEDDB
        console.log("Guardando topic en IndexedDB", topic);

        if (db) {
          const transaction = db.transaction(['topics'], 'readwrite');
          const store = transaction.objectStore('topics');
          const topicToSave = topic.toJSON()
          // Si es nuevo, asigna un id
          if (!topicToSave.id) {
            topicToSave.id = Date.now();
            console.log("Nuevo topic, asignando id:", topicToSave.id);
            
          }

          // Si es edición, asegúrate de que el id sea el mismo
          if (editId !== null) {
            topicToSave.id = editId;
            console.log("Editando topic, manteniendo id:", topicToSave.id);
            
          }
          // topic.toJSON() convierte el topic a un objeto plano serializable
          store.put(topicToSave);
          transaction.oncomplete = () => {
            console.log('Topic guardado en IndexedDB', topicsFromDB);
          };
          transaction.onerror = (event) => {
            console.error('Error guardando topic en IndexedDB:', event.target.error);
          };
        } else {
          console.warn('IndexedDB no está listo, no se guardó el topic');
        }
      }




      // Limpiar formulario
      setFormData({
        types: "",
        titulo: "",
        descripcion: "",
        comentario: "",
        fecha: null,
        statuses: "",
        labels: "",
      })
      setEditId(null)
      setShowForm(false)
    }


    console.log("topic creado", rdiList);


  }

  //let lst = Array.from(bcfTopicsRef.current.list);
  //console.log("/////", lst);

  const handleCancelar = () => {
    setFormData({
      types: "",
      titulo: "",
      descripcion: "",
      comentario: "",
      fecha: null,
      statuses: "",
      labels: "",
    })
    setEditId(null)
    setShowForm(false)
    setSnapShotReady(false)


  }

  const handleEdit = (item) => {
    setFormData({
      types: item.types,
      titulo: item.titulo,
      descripcion: item.descripcion,
      comentario: item.comentario,
      fecha: parseDateFromString(item.fecha),
      statuses: item.statuses,
      labels: item.labels,

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


  // Filtrar la lista según el filtro seleccionado
  const filteredRdiList = filterTipo
    ? rdiList.filter((rdi) => rdi.types === filterTipo)
    : rdiList

  // Handler para actualizar el estado de un item desde el selector en la lista
  const handleEstadoChangeInList = (id, newEstado) => {
    setRdiList((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, statuses: newEstado }
          : item
      )
    )
  }

  function clearAllTopics() {
    if (!db) {
      console.warn("IndexedDB no está listo");
      return;
    }
    const transaction = db.transaction(['topics'], 'readwrite');
    const store = transaction.objectStore('topics');
    const request = store.clear();
    request.onsuccess = () => {
      console.log('Todos los topics han sido eliminados de IndexedDB');
    };
    request.onerror = (event) => {
      console.error('Error al eliminar los topics:', event.target.error);
    };
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
            height: "100%",
            display: "flex",
            flexDirection: "column",
            position: "absolute",
            right: 0,
            top: { xs: "100%", sm: "auto" },
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
          { /* Panel de RDI */}
          {bcfTopicSet.labels &&
            (
              <TabPanel value={tabValue} index={0} sx={{ overflowY: "auto" }}>
                <Box sx={{ height: "100%", display: "flex", flexDirection: "column", overflowY: "auto" }}>
                  {/* Botón Agregar RDI */}
                  {!showForm ? <Button variant="contained" color="primary" onClick={handleAgregarRDI} sx={{ mb: 2 }} fullWidth>
                    AGREGAR RDI
                  </Button> : !snapShotReady ?
                    <Button variant="contained" color="primary" onClick={createViewpoint} sx={{ mb: 2 }} fullWidth>
                      AGREGAR SNAPSHOT
                    </Button> :
                    <Button variant="contained" color="primary" onClick={updateSnapshot} sx={{ mb: 2 }} fullWidth>
                      ACTUALIZAR SNAPSHOT
                    </Button>

                  }


                  {/* Línea divisoria */}
                  <Divider sx={{ mb: 2 }} />

                  {/* Formulario con transición Collapse */}
                  <Collapse in={showForm}>
                    <Box sx={{ p: 2, border: "1px solid #e0e0e0", borderRadius: 1 }} >
                      {snapshotUrl && (
                        <img
                          src={snapshotUrl}
                          alt="Viewpoint Snapshot"
                          style={{ maxWidth: '400px' }}
                        />
                      )}
                      {/*<div ref={snapShotRef}></div>*/}
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        {editId !== null ? "Editar RDI" : "Nuevo RDI"}
                      </Typography>
                      {/* Input titulo */}
                      <TextField
                        size="small"
                        fullWidth
                        label="Título"

                        slotProps={{ input: { style: inputStyles } }}
                        value={formData.titulo}
                        onChange={(e) => handleFormChange("titulo", e.target.value)}
                        sx={{
                          mb: 2, '& .MuiInputLabel-root': {
                            fontSize: '0.75rem'
                          }
                        }}
                      />
                      {/* Select de tipo */}
                      <FormControl fullWidth sx={{ mb: 2 }} size="small">

                        <InputLabel sx={inputStyles}>Tipo</InputLabel>
                        <Select
                          sx={inputStyles}
                          value={formData.types}
                          label="types"
                          onChange={(e) => handleFormChange("types", e.target.value)}
                        >
                          {Array.from(bcfTopicSet.types).map((tipo) => (
                            <MenuItem sx={inputStyles} key={tipo} value={tipo}>
                              {tipo}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      {/* Select de Asignar a */}
                      <FormControl fullWidth sx={{ mb: 2 }} size="small">

                        <InputLabel>Especialidad</InputLabel>
                        <Select
                          value={formData.labels}
                          label="labels"
                          onChange={(e) => handleFormChange("labels", e.target.value)}
                        >
                          {Array.from(bcfTopicSet.labels).map((esp) => (
                            <MenuItem key={esp} value={esp}>
                              {esp}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <FormControl fullWidth sx={{ mb: 2 }} size="small">
                        <InputLabel>Estado</InputLabel>
                        <Select
                          value={formData.statuses}
                          label="statuses"
                          onChange={(e) => handleFormChange("statuses", e.target.value)}
                        >
                          {Array.from(bcfTopicSet.statuses).map((estado) => (
                            <MenuItem key={estado} value={estado}>
                              {estado}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      {/* Input comentario */}
                      <TextField
                        size="small"
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
                        disabled
                        size="small"
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
                  {!showForm &&
                    <Box sx={{ flex: 1 }}>
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
                              {Array.from(bcfTopicSet.types).map((tipo) => (
                                <MenuItem key={tipo} value={tipo}>
                                  {tipo}
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
                                        value={rdi.statuses || ""}
                                        label="statuses"
                                        onChange={(e) => handleEstadoChangeInList(rdi.id, e.target.value)}
                                      >
                                        {Array.from(bcfTopicSet.statuses).map((estado) => (
                                          <MenuItem key={estado} value={estado}>
                                            {estado}
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
                                  primary={rdi.titulo}
                                  secondary={
                                    <Box>
                                      <Typography variant="body2" color="text.secondary" component="span">
                                        <strong>Tipo:</strong> {Array.from(bcfTopicSet.types).find((t) => t === rdi.types) || "No definido"}
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
                                        <strong>Estado:</strong> {rdi.statuses || "No definido"}
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
                  }
                  {!showForm &&
                    <Button variant="contained" color="warning" onClick={clearAllTopics} sx={{ mb: 2 }} fullWidth>
                      ELIMINAR DE DB
                    </Button>
                  }

                </Box>
              </TabPanel>
            )
          }

          <TabPanel value={tabValue} index={1}>
            <Box sx={{ height: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
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