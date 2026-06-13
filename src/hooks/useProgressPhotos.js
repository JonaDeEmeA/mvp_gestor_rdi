import { useState, useCallback, useRef, useEffect } from 'react';
import IndexedDBProgressRepository from '../repositories/IndexedDBProgressRepository';
import { PROGRESS_LIMITS } from '../constants/progressStandards';

const resizeImage = (file, maxWidth) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth) {
          const ratio = maxWidth / width;
          width = maxWidth;
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Error al redimensionar imagen'));
        }, file.type || 'image/jpeg', 0.85);
      };
      img.onerror = () => reject(new Error('Error al cargar imagen'));
      img.src = reader.result;
    };
    reader.onerror = () => reject(new Error('Error al leer archivo'));
    reader.readAsDataURL(file);
  });
};

export const useProgressPhotos = (snapshotId) => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const repoRef = useRef(null);
  const objectUrlsRef = useRef({});

  if (!repoRef.current) {
    repoRef.current = new IndexedDBProgressRepository();
  }

  const repo = repoRef.current;

  const revokeObjectUrl = useCallback((photoId) => {
    if (objectUrlsRef.current[photoId]) {
      URL.revokeObjectURL(objectUrlsRef.current[photoId]);
      delete objectUrlsRef.current[photoId];
    }
  }, []);

  const loadPhotos = useCallback(async (targetSnapshotId) => {
    const sid = targetSnapshotId || snapshotId;
    if (!sid) return;
    setLoading(true);
    setError(null);
    try {
      const rawPhotos = await repo.getPhotosBySnapshot(sid);

      for (const id of Object.keys(objectUrlsRef.current)) {
        if (!rawPhotos.some((p) => p.id === id)) {
          revokeObjectUrl(id);
        }
      }

      const photosWithUrls = rawPhotos.map((photo) => {
        if (photo.imageData && !objectUrlsRef.current[photo.id]) {
          objectUrlsRef.current[photo.id] = URL.createObjectURL(photo.imageData);
        }
        return {
          ...photo,
          objectUrl: objectUrlsRef.current[photo.id] || null,
        };
      });

      setPhotos(photosWithUrls);
      return photosWithUrls;
    } catch (err) {
      setError(err.message || 'Error al cargar fotografías');
    } finally {
      setLoading(false);
    }
  }, [snapshotId, revokeObjectUrl]);

  const addPhoto = useCallback(async (targetSnapshotId, file, caption) => {
    const sid = targetSnapshotId || snapshotId;
    if (!sid) throw new Error('No hay snapshot seleccionado');
    setError(null);

    const existingCount = photos.length;
    if (existingCount >= PROGRESS_LIMITS.maxPhotosPerSnapshot) {
      throw new Error(`Máximo ${PROGRESS_LIMITS.maxPhotosPerSnapshot} fotos por avance`);
    }

    try {
      const resizedBlob = await resizeImage(file, PROGRESS_LIMITS.maxImageWidth);
      const photo = await repo.addPhoto({
        snapshotId: sid,
        imageData: resizedBlob,
        caption: caption || '',
      });

      const objectUrl = URL.createObjectURL(resizedBlob);
      objectUrlsRef.current[photo.id] = objectUrl;

      const photoWithUrl = { ...photo, objectUrl };
      setPhotos((prev) => [...prev, photoWithUrl]);
      return photo;
    } catch (err) {
      setError(err.message || 'Error al agregar fotografía');
      throw err;
    }
  }, [snapshotId, photos.length, repo]); // eslint-disable-line react-hooks/exhaustive-deps

  const deletePhoto = useCallback(async (photoId) => {
    setError(null);
    try {
      await repo.deletePhoto(photoId);
      revokeObjectUrl(photoId);
      setPhotos((prev) => prev.filter((p) => p.id !== photoId));
    } catch (err) {
      setError(err.message || 'Error al eliminar fotografía');
      throw err;
    }
  }, [revokeObjectUrl]);

  useEffect(() => {
    return () => {
      for (const id of Object.keys(objectUrlsRef.current)) {
        URL.revokeObjectURL(objectUrlsRef.current[id]);
      }
      objectUrlsRef.current = {};
    };
  }, []);

  return {
    photos,
    loading,
    error,
    loadPhotos,
    addPhoto,
    deletePhoto,
  };
};

export default useProgressPhotos;
