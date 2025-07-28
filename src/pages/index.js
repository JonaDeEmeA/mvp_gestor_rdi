"use client"

import { useState } from "react"
import { Box, Button, Modal, TextField, Card, CardContent, Typography, Stack } from "@mui/material"

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false)
  const [proyectos, setProyectos] = useState([])
  const [formData, setFormData] = useState({
    nombre: "",
    mandante: "",
    año: "",
  })

  const handleOpenModal = () => {
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setFormData({ nombre: "", mandante: "", año: "" })
  }

  const handleInputChange = (field) => (event) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }))
  }

  const handleAceptar = () => {
    if (formData.nombre && formData.mandante && formData.año) {
      setProyectos((prev) => [...prev, formData])
      handleCloseModal()
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#EEEEEE",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 2,
      }}
    >
      {/* Cards de proyectos */}
      {proyectos.map((proyecto, index) => (
        <Card
          key={index}
          sx={{
            minWidth: 300,
            marginBottom: 2,
            boxShadow: 3,
          }}
        >
          <CardContent>
            <Typography variant="h6" component="h2" gutterBottom>
              {proyecto.nombre}
            </Typography>
            <Typography color="text.secondary" gutterBottom>
              <strong>Mandante:</strong> {proyecto.mandante}
            </Typography>
            <Typography color="text.secondary">
              <strong>Año:</strong> {proyecto.año}
            </Typography>
          </CardContent>
        </Card>
      ))}

      {/* Botón Crear Proyecto */}
      <Button
        variant="contained"
        onClick={handleOpenModal}
        sx={{
          backgroundColor: "#333333",
          color: "white",
          padding: "12px 24px",
          fontSize: "16px",
          "&:hover": {
            backgroundColor: "#555555",
          },
        }}
      >
        Crear Proyecto
      </Button>

      {/* Modal con formulario */}
      <Modal open={modalOpen} onClose={handleCloseModal} aria-labelledby="modal-title">
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography id="modal-title" variant="h6" component="h2" gutterBottom>
            Crear Nuevo Proyecto
          </Typography>

          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Nombre"
              variant="outlined"
              value={formData.nombre}
              onChange={handleInputChange("nombre")}
            />

            <TextField
              fullWidth
              label="Mandante"
              variant="outlined"
              value={formData.mandante}
              onChange={handleInputChange("mandante")}
            />

            <TextField
              fullWidth
              label="Año"
              variant="outlined"
              value={formData.año}
              onChange={handleInputChange("año")}
            />

            <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
              <Button variant="outlined" onClick={handleCloseModal}>
                Cancelar
              </Button>
              <Button
                variant="contained"
                onClick={handleAceptar}
                disabled={!formData.nombre || !formData.mandante || !formData.año}
                sx={{
                  backgroundColor: "#333333",
                  "&:hover": {
                    backgroundColor: "#555555",
                  },
                }}
              >
                Aceptar
              </Button>
            </Box>
          </Stack>
        </Box>
      </Modal>
    </Box>
  )
}
