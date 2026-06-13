import { useState, useRef, useEffect } from 'react';
import {
  Box, Typography, IconButton, TextField, Button, Paper, Alert,
} from '@mui/material';
import {
  AddAPhoto as CameraIcon, Delete as DeleteIcon, Image as GalleryIcon,
} from '@mui/icons-material';
import { BIM_COLORS } from '../../constants/designTokens';
import { PROGRESS_LIMITS } from '../../constants/progressStandards';

const PhotoThumbnail = ({ photo, onDelete }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        aspectRatio: '4/3',
        borderRadius: 1,
        overflow: 'hidden',
        border: `1px solid ${BIM_COLORS.neutral.border}`,
        bgcolor: BIM_COLORS.neutral.background.secondary,
      }}
    >
      {photo.objectUrl && (
        <Box
          component="img"
          src={photo.objectUrl}
          onLoad={() => setLoaded(true)}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: loaded ? 'block' : 'none',
          }}
        />
      )}
      {!loaded && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <Typography variant="caption" sx={{ color: BIM_COLORS.neutral.text.disabled }}>
            Cargando...
          </Typography>
        </Box>
      )}
      {photo.caption && loaded && (
        <Typography
          variant="caption"
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            bgcolor: 'rgba(0,0,0,0.6)',
            color: '#fff',
            p: 0.5,
            fontSize: '0.6rem',
            lineHeight: 1.2,
          }}
        >
          {photo.caption}
        </Typography>
      )}
      {onDelete && (
        <IconButton
          size="small"
          onClick={() => onDelete(photo.id)}
          sx={{
            position: 'absolute',
            top: 2,
            right: 2,
            bgcolor: 'rgba(0,0,0,0.5)',
            color: '#fff',
            p: 0.3,
            '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
            '& .MuiSvgIcon-root': { fontSize: 14 },
          }}
          title="Eliminar foto"
        >
          <DeleteIcon />
        </IconButton>
      )}
    </Box>
  );
};

const PhotoCapture = ({ existingPhotos, onAddPhoto, onDeletePhoto }) => {
  const fileInputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [saving, setSaving] = useState(false);
  const [addError, setAddError] = useState(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const remaining = PROGRESS_LIMITS.maxPhotosPerSnapshot - (existingPhotos?.length || 0);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
    setPreviewFile(file);
    setCaption('');
    setAddError(null);

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCaptureClick = () => {
    if (remaining <= 0) {
      setAddError(`Máximo ${PROGRESS_LIMITS.maxPhotosPerSnapshot} fotos por avance`);
      return;
    }
    fileInputRef.current?.click();
  };

  const handleSave = async () => {
    if (!previewFile) return;
    setSaving(true);
    setAddError(null);
    try {
      await onAddPhoto(previewFile, caption.trim());
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setPreviewFile(null);
      setCaption('');
    } catch (err) {
      setAddError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelPreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPreviewFile(null);
    setCaption('');
    setAddError(null);
  };

  return (
    <Box>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {addError && (
        <Alert severity="warning" sx={{ mb: 1, py: 0, fontSize: '0.7rem' }}>
          {addError}
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 0.5, mb: 1.5 }}>
        <Button
          size="small"
          variant="outlined"
          startIcon={<CameraIcon />}
          onClick={handleCaptureClick}
          disabled={remaining <= 0}
          sx={{
            fontSize: '0.65rem',
            textTransform: 'none',
            borderColor: BIM_COLORS.neutral.border,
            color: BIM_COLORS.neutral.text.secondary,
          }}
        >
          Cámara
        </Button>
        <Button
          size="small"
          variant="outlined"
          startIcon={<GalleryIcon />}
          onClick={() => fileInputRef.current?.click()}
          disabled={remaining <= 0}
          sx={{
            fontSize: '0.65rem',
            textTransform: 'none',
            borderColor: BIM_COLORS.neutral.border,
            color: BIM_COLORS.neutral.text.secondary,
          }}
        >
          Galería
        </Button>
        <Typography
          variant="caption"
          sx={{ ml: 'auto', color: BIM_COLORS.neutral.text.disabled, alignSelf: 'center' }}
        >
          {remaining}/{PROGRESS_LIMITS.maxPhotosPerSnapshot}
        </Typography>
      </Box>

      {previewUrl && (
        <Paper
          variant="outlined"
          sx={{
            p: 1,
            mb: 1.5,
            borderColor: BIM_COLORS.accent.main,
            bgcolor: BIM_COLORS.neutral.background.secondary,
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 1, color: BIM_COLORS.neutral.text.primary }}>
            Vista Previa
          </Typography>
          <Box
            component="img"
            src={previewUrl}
            sx={{
              width: '100%',
              maxHeight: 200,
              objectFit: 'contain',
              borderRadius: 1,
              mb: 1,
              bgcolor: '#000',
            }}
          />
          <TextField
            fullWidth
            size="small"
            label="Pie de foto (opcional)"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            sx={{ mb: 1 }}
            inputProps={{ style: { fontSize: '0.78rem' } }}
          />
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Button size="small" variant="outlined" onClick={handleCancelPreview}>
              Cancelar
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={handleSave}
              disabled={saving}
              sx={{ bgcolor: BIM_COLORS.accent.main, '&:hover': { bgcolor: BIM_COLORS.accent.active } }}
            >
              {saving ? 'Guardando...' : 'Guardar Foto'}
            </Button>
          </Box>
        </Paper>
      )}

      {existingPhotos && existingPhotos.length > 0 && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 1,
          }}
        >
          {existingPhotos.map((photo) => (
            <PhotoThumbnail
              key={photo.id}
              photo={photo}
              onDelete={onDeletePhoto}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default PhotoCapture;
