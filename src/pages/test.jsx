"use client"

import { useState } from "react"
import {
  Paper,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from "@mui/material"
import { Visibility } from "@mui/icons-material"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"

const theme = createTheme()

export default function HomePage() {
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    textField1: "",
    textField2: "",
    selectField: "",
  })
  const [savedData, setSavedData] = useState([])
  const [selectedItem, setSelectedItem] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({})

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleEditInputChange = (field, value) => {
    setEditData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSave = () => {
    if (formData.textField1 && formData.textField2 && formData.selectField) {
      setSavedData((prev) => [...prev, { ...formData, id: Date.now() }])
      setFormData({ textField1: "", textField2: "", selectField: "" })
      setShowForm(false)
    }
  }

  const handleCancel = () => {
    setFormData({ textField1: "", textField2: "", selectField: "" })
    setShowForm(false)
  }

  const handleItemClick = (item) => {
    setSelectedItem(item)
    setEditData(item)
    setIsEditing(false)
  }

  const handleEditSave = () => {
    setSavedData((prev) => prev.map((item) => (item.id === selectedItem.id ? { ...editData } : item)))
    setSelectedItem({ ...editData })
    setIsEditing(false)
  }

  const handleEditCancel = () => {
    setEditData(selectedItem)
    setIsEditing(false)
  }

  const closeDetailView = () => {
    setSelectedItem(null)
    setIsEditing(false)
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: "flex", minHeight: "100vh", position: "relative" }}>
        {/* Left Panel - Detail View */}
        {selectedItem && (
          <Paper
            elevation={3}
            sx={{
              position: "fixed",
              left: 0,
              top: 0,
              width: "25%",
              height: "100vh",
              p: 3,
              zIndex: 1000,
              overflow: "auto",
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="h6">Detalles del Elemento</Typography>
              <Box>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setIsEditing(true)}
                  disabled={isEditing}
                  sx={{ mr: 1 }}
                >
                  Editar
                </Button>
                <Button variant="outlined" onClick={closeDetailView}>
                  Cerrar
                </Button>
              </Box>
            </Box>

            <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                label="Campo de Texto 1"
                value={editData.textField1 || ""}
                onChange={(e) => handleEditInputChange("textField1", e.target.value)}
                disabled={!isEditing}
                fullWidth
              />

              <TextField
                label="Campo de Texto 2"
                value={editData.textField2 || ""}
                onChange={(e) => handleEditInputChange("textField2", e.target.value)}
                disabled={!isEditing}
                fullWidth
              />

              <FormControl fullWidth disabled={!isEditing}>
                <InputLabel>Campo de Selección</InputLabel>
                <Select
                  value={editData.selectField || ""}
                  onChange={(e) => handleEditInputChange("selectField", e.target.value)}
                  label="Campo de Selección"
                >
                  <MenuItem value="opcion1">Opción 1</MenuItem>
                  <MenuItem value="opcion2">Opción 2</MenuItem>
                  <MenuItem value="opcion3">Opción 3</MenuItem>
                </Select>
              </FormControl>

              {isEditing && (
                <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                  <Button variant="contained" color="primary" onClick={handleEditSave} fullWidth>
                    Guardar
                  </Button>
                  <Button variant="outlined" onClick={handleEditCancel} fullWidth>
                    Cancelar
                  </Button>
                </Box>
              )}
            </Box>
          </Paper>
        )}

        {/* Main Content Area */}
        <Box sx={{ flexGrow: 1, p: 3 }}>
          <Typography variant="h4" gutterBottom>
            Aplicación con Material-UI
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Utiliza el panel derecho para agregar nuevos elementos y ver la lista de datos guardados.
          </Typography>
        </Box>

        {/* Right Panel - Form and List */}
        <Paper
          elevation={3}
          sx={{
            position: "fixed",
            right: 0,
            top: 0,
            width: "25%",
            height: "100vh",
            p: 3,
            overflow: "auto",
          }}
        >
          <Typography variant="h6" gutterBottom>
            Panel de Control
          </Typography>

          {!showForm ? (
            <>
              <Button variant="contained" color="primary" onClick={() => setShowForm(true)} fullWidth sx={{ mb: 3 }}>
                Agregar Nuevo Elemento
              </Button>

              {savedData.length > 0 && (
                <>
                  <Typography variant="subtitle1" gutterBottom>
                    Elementos Guardados:
                  </Typography>
                  <List>
                    {savedData.map((item) => (
                      <ListItem
                        key={item.id}
                        sx={{
                          border: "1px solid #e0e0e0",
                          borderRadius: 1,
                          mb: 1,
                          bgcolor: "background.paper",
                        }}
                      >
                        <ListItemText
                          primary={item.textField1}
                          secondary={`${item.textField2} - ${item.selectField}`}
                        />
                        <IconButton color="primary" onClick={() => handleItemClick(item)}>
                          <Visibility />
                        </IconButton>
                      </ListItem>
                    ))}
                  </List>
                </>
              )}
            </>
          ) : (
            <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Nuevo Elemento
              </Typography>

              <TextField
                label="Campo de Texto 1"
                value={formData.textField1}
                onChange={(e) => handleInputChange("textField1", e.target.value)}
                fullWidth
                required
              />

              <TextField
                label="Campo de Texto 2"
                value={formData.textField2}
                onChange={(e) => handleInputChange("textField2", e.target.value)}
                fullWidth
                required
              />

              <FormControl fullWidth required>
                <InputLabel>Campo de Selección</InputLabel>
                <Select
                  value={formData.selectField}
                  onChange={(e) => handleInputChange("selectField", e.target.value)}
                  label="Campo de Selección"
                >
                  <MenuItem value="opcion1">Opción 1</MenuItem>
                  <MenuItem value="opcion2">Opción 2</MenuItem>
                  <MenuItem value="opcion3">Opción 3</MenuItem>
                </Select>
              </FormControl>

              <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                <Button variant="contained" color="primary" onClick={handleSave} fullWidth>
                  Confirmar
                </Button>
                <Button variant="outlined" onClick={handleCancel} fullWidth>
                  Cancelar
                </Button>
              </Box>
            </Box>
          )}
        </Paper>
      </Box>
    </ThemeProvider>
  )
}
