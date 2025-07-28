"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import * as WEBIFC from 'web-ifc';
import * as FRAGS from '@thatopen/fragments';
import * as OBC from "@thatopen/components";
import * as OBCF from "@thatopen/components-front";
import { FragmentsModels } from '@thatopen/fragments';
//import * as BUI from '@thatopen/ui';.....

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';


import Head from "next/head";
import Image from "next/image";
import localFont from "next/font/local";
import styles from "@/styles/Home.module.css";
import TabStandar from "@/componentes/TabStandar";
import Browser from "@/componentes/Browser";
import TabTools from "@/componentes/TabTools";
import useDebouncedCameraUpdate from "@/utilitario/debounce";
import { tr } from "date-fns/locale";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function Home() {
  const containerRef = useRef(null);
  const componentsRef = useRef(null);

  const fragmentLoaderRef = useRef(null);
  const fragmentIfcLoaderRef = useRef(null);
  const worldRef = useRef(null);
  const fragmentsRef = useRef(null);
  const topicRef = useRef(null);
  const convertIFC = useRef(null);
  const loaderRef = useRef(null);

  let fragmentBytes = null;

  const [importedModel, setImportedModel] = useState([]);
  const [showBrowser, setShowBrowser] = useState(false);
  const [showRDIManager, setShowRDIManager] = useState(false);
  //  console.log('importedModel', importedModel);

  useEffect(() => {

    setImportedModel([]); // Reiniciar el estado al cargar la página

    if (typeof window === 'undefined') return;
    let control = null;
    const initViewer = async () => {

      const BUI = await import('@thatopen/ui');
      const container = containerRef.current;

      const components = new OBC.Components();
      componentsRef.current = components;

      const worlds = components.get(OBC.Worlds);
      const world = worlds.create();
      world.scene = new OBC.SimpleScene(components);
      world.renderer = new OBC.SimpleRenderer(components, container);
      world.camera = new OBC.SimpleCamera(components);
      await components.init();
      if (!world.camera.controls.object && world.camera.three) {
        world.camera.controls.object = world.camera.three;
      }
      control = world.camera.controls;
      world.scene.three.background = null;
      control.setLookAt(12, 10, 50, 0, 0, 0);
      world.scene.setup();

      const grids = components.get(OBC.Grids);
      grids.create(world);

      worldRef.current = world;

      const workerUrl = '/workers/worker.mjs';
      const fragments = new FRAGS.FragmentsModels(workerUrl);
      fragmentsRef.current = fragments;

      // Actualización completa cuando para 
      /*world.camera.controls.addEventListener('rest', () => {
        fragments.update(true);
      });*/

      // Actualización continua durante movimiento
      world.camera.controls.addEventListener('update', () => {
        fragments.update(true);
      });


      /*function handleCameraChange() {
        console.log('Camera changed');
        if (fragments) {
          fragments.update(true);
          //fragments.core.update(true);
        }
      }

      control.addEventListener("rest", handleCameraChange);
      //control.addEventListener('update', handleCameraChange);*/





      //console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(control)));
      //console.log(world.camera)
      //console.log(Object.getPrototypeOf(control));

      //IFC LOADER
      /*const ifcLoader = components.get(OBC.IfcLoader)
      await ifcLoader.setup({
        autoSetWasm: false,
        wasm: {
          path: "https://unpkg.com/web-ifc@0.0.69/",
          absolute: true,
        },
        // Configuraciones adicionales
        coordinate: true,
        weldVertices: true,
        useCache: true,
      });

      // Configurar el procesamiento de geometría específico
      ifcLoader.settings.webIfc = {
        COORDINATE_TO_ORIGIN: true,
        USE_FAST_BOOLEANS: true,
        CIRCLE_SEGMENTS_MEDIUM: 12, // Mejor resolución para tuberías circulares
        CIRCLE_SEGMENTS_HIGH: 24,
        COORDINATE_TO_ORIGIN: true, // CRÍTICO: Mantener coordenadas originales
      };

      const fragmentsManage = components.get(OBC.FragmentsManager)

      fragmentsManage.init(workerUrl)

      fragmentsManage.list.onItemSet.add(({ value: model }) => {
        model.useCamera(world.camera.three)
        world.scene.three.add(model.object)
        fragmentsManage.core.update(true)
      })

      loaderRef.current = ifcLoader;*/


      const removeModel = async () => {
        await fragments.disposeModel("example");
      };





      // FPS stats
      /*const stats = new Stats();
      stats.showPanel(0);
      document.body.appendChild(stats.dom);
      world.renderer.onBeforeUpdate.add(() => stats.begin());
      world.renderer.onAfterUpdate.add(() => stats.end());*/


      // Configurar Outliner
      /*const outliner = components.get(OBCF.Outliner);
      outliner.world = world;
      outliner.enabled = true;
     


      outliner.create(
        'example',
        new THREE.MeshBasicMaterial({
          color: 0xbcf124,
          transparent: true,
          opacity: 0.5,
        })
      );

      highlighter.events.select.onHighlight.add((data) => {
        outliner.clear('example');
        outliner.add('example', data);
      });

      highlighter.events.select.onClear.add(() => {
        outliner.clear('example');
      });*/



      //console.log(Object.getPrototypeOf(topic));
      






    };


    initViewer();




    return () => {
      if (componentsRef.current) {
        componentsRef.current.dispose();
      }
      //if (control) {
      //  control.removeEventListener('update', handleCameraChange);
      //}
      // Elimina el panel si existe
      const existingPanel = document.getElementById('controls-panel');
      if (existingPanel) {
        existingPanel.remove();
      }
    };
  }, []);






  const exportBCF = async () => {
    const bcfData = await bcfTopics.export();
    const bcfFile = new File([bcfData], "topics.bcf");
    const url = URL.createObjectURL(bcfFile);
    const a = document.createElement("a");
    a.href = url;
    a.download = "topics.bcf";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Función para ocultar el Browser
  const handleCloseBrowser = () => {
    setShowBrowser(!showBrowser);
  };
  const handleCloseRDIManager = () => {
    setShowRDIManager(!showRDIManager);
  };

  const OcultarModelo = (id) => {

    console.log(importedModel);

    if (importedModel.length > 0) {
      //importedModel[0].object.visible = isVisible; // Oculta el modelo
      const modelo = importedModel.find(el => el.object.uuid === id);
      if (modelo) {
        modelo.object.visible = !modelo.object.visible;
        fragmentsRef.current.update(true);
        setImportedModel([...importedModel]);
      }
    }
  };

  const fileInputRef = useRef(null);

  // Función para guardar archivo .frag
  async function saveFragmentFile(fragmentBytes, fileName) {
    try {
      // Crear blob con los bytes del fragmento
      const blob = new Blob([fragmentBytes], {
        type: 'application/octet-stream'
      });

      // Crear enlace de descarga
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;

      // Descargar automáticamente
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Limpiar URL
      URL.revokeObjectURL(url);

      console.log(`Archivo ${fileName} guardado exitosamente`);

    } catch (error) {
      console.error('Error guardando fragmento:', error);
      throw error;
    }
  }

  const handleButtonClick = async () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Permite seleccionar el mismo archivo varias veces
      fileInputRef.current.click();
    }


  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const ext = file.name.split('.').pop().toLowerCase();
    const world = worldRef.current;
    const fragments = fragmentsRef.current; // usa la instancia inicializada
    //const components = componentsRef.current;

    if (!fragments) {
      alert("FragmentsManager no inicializado.");
      return;
    }

    if (ext === 'ifc') {

      //IFCLOADER
      /*const arrayBuffer = await file.arrayBuffer()
      const uint8Array = new Uint8Array(arrayBuffer)
      await loaderRef.current.load(uint8Array, false, file.name, {
        processData: {
          progressCallback: (progress) => console.log("Progress:", progress),
        },
      })*/

      const serializer = new FRAGS.IfcImporter();
      serializer.wasm = { absolute: true, path: '/web-ifc/' };
      // Configuración completa para máxima geometría
      serializer.settings = {
        coordinate: false,
        includeProperties: true,
        weldVertices: true,
        webIfc: {
          COORDINATE_TO_ORIGIN: false,
          USE_FAST_BOOLEANS: true,
          CIRCLE_SEGMENTS_HIGH: 32,
          OPTIMIZE_PROFILES: true,
          INCLUDE_CURVES: true,
          CURVE_DIVISIONS: 12,
        }
      };
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);

      // Procesar IFC a fragmentos
      const fragmentBytes = await serializer.process({ bytes });
      console.log('Fragmentos generados:', fragmentBytes.length, 'bytes');

      // Cargar en el gestor de fragmentos
      const model = await fragments.load(fragmentBytes, { modelId: file.name, coordinate: false, properties: true });
      // Verificar geometría cargada
      const fragModel = fragments.models.list.get(file.name);
      console.log('Modelos disponibles:', fragModel);
      console.log('propiedades:', Object.keys(fragModel));
      //console.log('Geometrías disponibles:', Object.keys(fragModel.geometries).length);
      // Verificar geometría Three.js
      if (fragModel.object && fragModel.object.children) {
        setTimeout(() => {
          console.log('Meshes cargados:', fragModel.object.children.length);
        }, 2000); // 2000 milisegundos = 2 segundos



        // Analizar cada mesh
        let totalVertices = 0;

        setTimeout(() => {
          fragModel.object.children.forEach((mesh) => {
            if (mesh.geometry && mesh.geometry.attributes.position) {
              const vertices = mesh.geometry.attributes.position.count;
              totalVertices += vertices;
              //console.log(`Mesh ${index}: ${vertices} vértices, Material: ${mesh.material?.type || 'N/A'}`);
            }
          });
          console.log('Total de vértices en el modelo:', totalVertices);
        }, 2000); // 2000 milisegundos = 2 segundos

      }

      // GUARDAR COMO .FRAG
      const fragmentFileName = file.name.replace('.ifc', '.frag');
      await saveFragmentFile(fragmentBytes, fragmentFileName);

      setImportedModel(prevArray => [...prevArray, fragModel]);


      model.useCamera(world.camera.three);
      world.scene.three.add(model.object);
      await fragments.update(true);

    } else if (ext === 'frag') {


      const buffer = await file.arrayBuffer();
      const model = await fragments.load(buffer, { modelId: file.name });
      const fragModel = fragments.models.list.get(file.name);
      // Verificar carga
      console.log('Fragment cargado:', fragModel);
      console.log('Propiedades disponibles:', Object.keys(fragModel));
      // Verificar geometría Three.js
      if (fragModel.object && fragModel.object.children) {
        //console.log('Meshes cargados:', fragModel.object.children.length);

        // Analizar cada mesh
        let totalVertices = 0;
        setTimeout(() => {
          fragModel.object.children.forEach((mesh, index) => {
            if (mesh.geometry && mesh.geometry.attributes.position) {
              const vertices = mesh.geometry.attributes.position.count;
              totalVertices += vertices;
              console.log(`Mesh ${index}: ${vertices} vértices, Material: ${mesh.material?.type || 'N/A'}`);
            }
          });

          console.log('Total de vértices en el modelo:', totalVertices);
        }, 2000); // 2000 milisegundos = 2 segundos

      }
      setImportedModel(prevArray => [...prevArray, fragModel]);


      model.useCamera(world.camera.three);
      world.scene.three.add(model.object);
      await fragments.update(true);



    } else if (ext === 'json') {
      const text = await file.text();
      const jsonData = JSON.parse(text);
      window.selectedJson = jsonData;
      console.log('JSON cargado:', jsonData);
    } else {
      alert('Tipo de archivo no soportado');
    }

  };



  return (
    <>

      <Box
        sx={{

          minHeight: "100vh",
          minWidth: "100vw",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",



          background: "#181818", // opcional, para fondo oscuro
        }}
      >

        <Box
          ref={containerRef}
          sx={{
            width: "100%",
            height: "100vh",
            borderRadius: 5,
            background: "#222", // opcional, para distinguir el visor
            boxShadow: 3,
            display: "block",
            position: "relative",

          }}
        >
          <TabStandar
            onCargarFile={handleButtonClick}
            hideModel={OcultarModelo}
            onCloseBrowser={handleCloseBrowser}
            onCloseRdiManager={handleCloseRDIManager} />

          <input
            type="file"
            accept=".ifc,.frag,.json"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
          {showBrowser && (<Browser
            ocultarModelo={OcultarModelo}
            listaModelos={importedModel}
            onCloseBrowser={handleCloseBrowser}
            sx={{
              position: "absolute",
              top: "20%",
              left: "2%",
              zIndex: 10,
              width: 320,
              pointerEvents: "auto"
            }} />)}



        </Box>
        {showRDIManager && (
          <TabTools
            component={componentsRef.current}
            world={worldRef.current}
            topic={topicRef.current}
            exportBCF={exportBCF}
            sx={{
              position: { xs: "static", sm: "absolute" },
              width: { xs: "100vw", sm: "auto" },
              left: { sm: 0 },
              right: { sm: 0 },
              top: { sm: 0 },
              bottom: { sm: 0 },
              height: { xs: "auto", sm: "90%" },
              zIndex: 20,
              pointerEvents: "none",
              borderRadius: { xs: 0, sm: 5 },

            }} />
        )}

      </Box>

    </>

  );
}
