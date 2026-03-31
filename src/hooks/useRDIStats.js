// src/hooks/useRDIStats.js
// Hook que lee todas las RDIs de IndexedDB y calcula métricas para gráficos.
// Diseño intencionalmente simple y desacoplado: sin dependencias externas,
// solo lectura pura de IndexedDB. Fácil de escalar añadiendo filtros por proyecto.

import { useState, useEffect, useCallback } from 'react';

const DB_NAME = 'BCFDatabase';
const STORE_NAME = 'topics';

/**
 * Lee todos los RDIs del store 'topics' de IndexedDB.
 * @returns {Promise<Array>} Lista de RDI objects
 */
const readAllRDIsFromDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onsuccess = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        resolve([]);
        return;
      }

      const tx = db.transaction([STORE_NAME], 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const getAllRequest = store.getAll();

      getAllRequest.onsuccess = () => resolve(getAllRequest.result || []);
      getAllRequest.onerror = (e) => reject(e.target.error);
    };

    request.onerror = (e) => reject(e.target.error);
  });
};

/**
 * Calcula métricas agregadas a partir de una lista de RDIs.
 * @param {Array} rdiList
 * @returns {Object} stats
 */
const computeStats = (rdiList) => {
  // -- Por Estado --
  const byStatus = rdiList.reduce((acc, rdi) => {
    const key = rdi.estado || rdi.statuses || 'Sin estado';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  // -- Por Tipo --
  const byType = rdiList.reduce((acc, rdi) => {
    const key = rdi.tipo || rdi.types || 'Sin tipo';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  // -- Por Etiqueta/Especialidad --
  const byLabel = rdiList.reduce((acc, rdi) => {
    const key = rdi.etiqueta || rdi.labels || 'Sin etiqueta';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  // -- Evolución temporal (por mes, últimos 6 meses) --
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return {
      label: d.toLocaleString('es-CL', { month: 'short', year: '2-digit' }),
      year: d.getFullYear(),
      month: d.getMonth(),
    };
  });

  const byMonth = months.map(({ label, year, month }) => {
    const count = rdiList.filter((rdi) => {
      const dateStr = rdi.creationDate || rdi.createdAt || rdi.fecha;
      if (!dateStr) return false;
      const d = new Date(dateStr);
      return d.getFullYear() === year && d.getMonth() === month;
    }).length;
    return { label, count };
  });

  return {
    total: rdiList.length,
    byStatus,
    byType,
    byLabel,
    byMonth,
  };
};

/**
 * Hook principal: expone estadísticas de RDIs y un método de recarga manual.
 */
export const useRDIStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const rdiList = await readAllRDIsFromDB();
      const computed = computeStats(rdiList);
      setStats(computed);
    } catch (err) {
      console.error('[useRDIStats] Error leyendo RDIs:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return { stats, loading, error, refresh: loadStats };
};
