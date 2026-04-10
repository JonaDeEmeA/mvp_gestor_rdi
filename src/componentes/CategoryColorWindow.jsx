import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
  CircularProgress,
  Autocomplete,
  TextField,
  Chip,
  Tooltip
} from '@mui/material';
import {
  ColorLens as ColorIcon,
  PlayArrow as PlayIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  ClearAll as ClearIcon
} from '@mui/icons-material';
import * as THREE from 'three';
import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import FloatingWindow from './FloatingWindow';

/**
 * Ventana evolucionada para aplicar colores por categoría dinámica
 */
const CategoryColorWindow = ({ open, onClose, components }) => {
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [applied, setApplied] = useState(false);

  // Categorías disponibles en el modelo
  const [availableCategories, setAvailableCategories] = useState([]);

  // Categorías seleccionadas por el usuario [{ name: string, color: string }]
  const [selectedCategories, setSelectedCategories] = useState([]);

  // Valor actual del selector
  const [categoryInput, setCategoryInput] = useState(null);

  // Paleta de colores premium (HSL tailored / vibrant)
  const colorPalette = [
    '#3b82f6', // Blue
    '#ef4444', // Red
    '#10b981', // Green
    '#f59e0b', // Amber
    '#8b5cf6', // Violet
    '#ec4899', // Pink
    '#06b6d4', // Cyan
    '#f97316', // Orange
    '#6366f1', // Indigo
    '#14b8a6', // Teal
  ];

  // Función para escanear categorías reales del modelo
  const scanModelCategories = useCallback(async () => {
    if (!components || !open) return;
    setScanning(true);
    try {
      const fragments = components.get(OBC.FragmentsManager);
      for (const [modelId, model] of fragments.list) {
        const categories = await model.getItemsWithGeometryCategories();
        console.log(`Categorías en modelo ${modelId}:`, categories);
      }

      const allEntities = new Set();

      for (const [, model] of fragments.list) {
        const categories = await model.getItemsWithGeometryCategories();
        for (const category of categories) {
          if (category) allEntities.add(category);
        }
      }

      const sortedEntities = Array.from(allEntities).sort();
      setAvailableCategories(sortedEntities);
      console.log("Categorías encontradas:", sortedEntities);
    } catch (error) {
      console.error("Error escaneando categorías:", error);
    } finally {
      setScanning(false);
    }
  }, [components, open]);

  // Escanear al abrir la ventana
  useEffect(() => {
    if (open) {
      scanModelCategories();
    }
  }, [open, scanModelCategories]);

  const handleAddCategory = () => {
    if (!categoryInput) return;

    // Evitar duplicados
    if (selectedCategories.find(c => c.name === categoryInput)) return;

    // Asignar color automático de la paleta
    const colorIndex = selectedCategories.length % colorPalette.length;
    const newCategory = {
      name: categoryInput,
      color: colorPalette[colorIndex]
    };

    setSelectedCategories([...selectedCategories, newCategory]);
    setCategoryInput(null);
  };

  const handleRemoveCategory = (name) => {
    setSelectedCategories(selectedCategories.filter(c => c.name !== name));
  };

  const handleChangeColor = (name) => {
    const currentIndex = selectedCategories.findIndex(c => c.name === name);
    const currentColor = selectedCategories[currentIndex].color;
    const paletteIndex = colorPalette.indexOf(currentColor);
    const nextColor = colorPalette[(paletteIndex + 1) % colorPalette.length];

    const newCategories = [...selectedCategories];
    newCategories[currentIndex].color = nextColor;
    setSelectedCategories(newCategories);
  };

  const handleApplyColors = async () => {
    if (!components || selectedCategories.length === 0) return;
    setLoading(true);

    try {
      const finder = components.get(OBC.ItemsFinder);
      const classifier = components.get(OBC.Classifier);
      const highlighter = components.get(OBF.Highlighter);

      // Limpiar clasificaciones y estilos previos  
      classifier.list.delete("UserCategoryColors");

      // Limpiar estilos previos del highlighter  
      for (const cat of selectedCategories) {
        highlighter.styles.delete(`style-${cat.name}`);
      }

      console.log("Procesando categorías:", selectedCategories.map(c => c.name));

      // Paso 1: Crear consultas con regex correcto  
      for (const cat of selectedCategories) {
        console.log(`Creando consulta para categoría: ${cat.name}`);
        finder.create(cat.name, [{
          categories: [new RegExp(`^${cat.name}$`)]
        }]);
      }

      // Paso 2: Configurar grupos en el classifier  
      for (const cat of selectedCategories) {
        classifier.setGroupQuery("UserCategoryColors", cat.name, {
          name: cat.name
        });
      }

      // Paso 3: Aplicar estilos y highlighting  
      for (const cat of selectedCategories) {
        // Definir estilo primero  
        highlighter.styles.set(`style-${cat.name}`, {
          color: new THREE.Color(cat.color),
          opacity: 1,
          transparent: false,
          renderedFaces: 0,
        });

        // Obtener datos del grupo  
        const group = classifier.getGroupData("UserCategoryColors", cat.name);
        console.log(`Grupo obtenido para ${cat.name}:`, group);

        if (group) {
          const map = await group.get();
          console.log(`Map obtenido para ${cat.name}:`, map);

          // Verificar que el map tenga elementos  
          const hasItems = map && Object.keys(map).some(modelId =>
            map[modelId] && map[modelId].size > 0
          );

          if (hasItems) {
            console.log(`Aplicando highlight a ${cat.name}`);
            await highlighter.highlightByID(`style-${cat.name}`, map);
          } else {
            console.warn(`No se encontraron elementos para la categoría: ${cat.name}`);
          }
        } else {
          console.error(`No se pudo obtener el grupo para: ${cat.name}`);
        }
      }

      setApplied(true);
      console.log("Colores aplicados exitosamente");
    } catch (error) {
      console.error("Error aplicando colores:", error);
      setApplied(false);
    } finally {
      setLoading(false);
    }
  };

  const handleClearColors = async () => {
    if (!components) return;
    try {
      const highlighter = components.get(OBF.Highlighter);
      for (const cat of selectedCategories) {
        highlighter.clear(`style-${cat.name}`);
      }
      setApplied(false);
    } catch (error) {
      console.error("Error al limpiar colores:", error);
    }
  };

  return (
    <FloatingWindow
      open={open}
      onClose={onClose}
      title="Color por Categoría"
      width="320px"
      height="auto"
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            {availableCategories.length > 0
              ? `${availableCategories.length} categorías detectadas`
              : 'Escanenado modelo...'}
          </Typography>
          <IconButton size="small" onClick={scanModelCategories} disabled={scanning}>
            {scanning ? <CircularProgress size={16} /> : <RefreshIcon fontSize="inherit" />}
          </IconButton>
        </Box>

        {/* Selector de Categorías */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Autocomplete
            fullWidth
            size="small"
            value={categoryInput}
            onChange={(event, newValue) => setCategoryInput(newValue)}
            options={availableCategories}
            renderInput={(params) => (
              <TextField {...params} label="Seleccionar Categoría" variant="outlined" />
            )}
            sx={{
              '& .MuiOutlinedInput-root': { borderRadius: 1.5 }
            }}
          />
          <IconButton
            onClick={handleAddCategory}
            disabled={!categoryInput}
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': { bgcolor: 'primary.dark' },
              '&.Mui-disabled': { bgcolor: 'action.disabledBackground' }
            }}
          >
            <AddIcon />
          </IconButton>
        </Box>

        {/* Lista de Categorías Activas */}
        <Box sx={{
          maxHeight: '200px',
          overflowY: 'auto',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1.5,
          p: 0.5,
          bgcolor: 'rgba(0,0,0,0.02)'
        }}>
          {selectedCategories.length === 0 ? (
            <Typography variant="body2" sx={{ p: 2, textAlign: 'center', color: 'text.disabled' }}>
              No hay categorías agregadas
            </Typography>
          ) : (
            <List dense>
              {selectedCategories.map((cat) => (
                <ListItem
                  key={cat.name}
                  secondaryAction={
                    <IconButton edge="end" size="small" onClick={() => handleRemoveCategory(cat.name)}>
                      <DeleteIcon fontSize="inherit" />
                    </IconButton>
                  }
                  sx={{ borderRadius: 1, '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' } }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Tooltip title="Cambiar color">
                      <IconButton
                        size="small"
                        onClick={() => handleChangeColor(cat.name)}
                        sx={{ p: 0.5 }}
                      >
                        <Box sx={{
                          width: 20,
                          height: 20,
                          bgcolor: cat.color,
                          borderRadius: '4px',
                          border: '1px solid rgba(255,255,255,0.3)',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }} />
                      </IconButton>
                    </Tooltip>
                  </ListItemIcon>
                  <ListItemText
                    primary={cat.name}
                    primaryTypographyProps={{ variant: 'body2', noWrap: true, fontWeight: 500 }}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            fullWidth
            variant="outlined"
            size="small"
            color="inherit"
            startIcon={<ClearIcon />}
            onClick={() => {
              handleClearColors();
              setSelectedCategories([]);
            }}
            disabled={selectedCategories.length === 0 || loading}
          >
            Limpiar Todo
          </Button>
          <Button
            fullWidth
            variant="contained"
            size="small"
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <PlayIcon />}
            onClick={applied ? handleClearColors : handleApplyColors}
            disabled={selectedCategories.length === 0 || loading}
            sx={{
              bgcolor: applied ? 'error.main' : '#1F3A5F',
              '&:hover': { bgcolor: applied ? 'error.dark' : '#2c5282' }
            }}
          >
            {loading ? 'Aplicando...' : applied ? 'Quitar Efecto' : 'Aplicar'}
          </Button>
        </Box>
      </Box>
    </FloatingWindow>
  );
};

export default CategoryColorWindow;
