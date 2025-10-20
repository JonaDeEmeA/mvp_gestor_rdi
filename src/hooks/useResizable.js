import { useState, useEffect, useCallback, useRef } from 'react';

export const useResizable = (initialWidth = 20, minWidth = 20, maxWidth = 80, anchor = 'right') => {
  const [width, setWidth] = useState(initialWidth);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef(null);

  // Manejar inicio del redimensionamiento
  const handleMouseDown = useCallback((e) => {
    setIsResizing(true);
    e.preventDefault();
  }, []);

  // Manejar movimiento del mouse durante redimensionamiento
  const handleMouseMove = useCallback(
    (e) => {
      if (!isResizing || !containerRef.current) return;

      const parentRect = containerRef.current.parentElement.getBoundingClientRect();
      
      let newWidth;
      if (anchor === 'left') {
        // Para un panel anclado a la izquierda, calcular desde el borde izquierdo.
        newWidth = ((e.clientX - parentRect.left) / parentRect.width) * 100;
      } else {
        // Para un panel anclado al lado derecho, calcular desde el borde derecho.
        newWidth = ((parentRect.right - e.clientX) / parentRect.width) * 100;
      }

      // Aplicar límites mínimos y máximos
      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setWidth(newWidth);
      }
    },
    [isResizing, minWidth, maxWidth, anchor]
  );

  // Manejar fin del redimensionamiento
  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  // Configurar y limpiar event listeners
  useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  // Resetear ancho
  const resetWidth = () => {
    setWidth(initialWidth);
  };

  // Establecer ancho específico
  const setSpecificWidth = (newWidth) => {
    if (newWidth >= minWidth && newWidth <= maxWidth) {
      setWidth(newWidth);
    }
  };

  return {
    width,
    isResizing,
    containerRef,
    handleMouseDown,
    resetWidth,
    setSpecificWidth,
  };
};