// src/utils/indexedDBManager.js

const DB_NAME = 'ProjectsIssuesDB';
const DB_VERSION = 1;

// 🔧 Inicializar IndexedDB
export const initDB = () => {
  return new Promise((resolve, reject) => {
    console.log('🔄 PASO 3.1: Abriendo IndexedDB...');
    
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('❌ Error abriendo IndexedDB:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      console.log('✅ PASO 3.1 COMPLETADO: IndexedDB abierta');
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      console.log('🔄 PASO 3.2: Creando esquema de BD...');

      // Store para proyectos
      if (!db.objectStoreNames.contains('projects')) {
        const projectStore = db.createObjectStore('projects', { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        projectStore.createIndex('userEmail', 'userEmail', { unique: false });
        projectStore.createIndex('name', 'name', { unique: false });
        projectStore.createIndex('createdAt', 'createdAt', { unique: false });
        console.log('✅ Store "projects" creado');
      }

      // Store para issues
      if (!db.objectStoreNames.contains('issues')) {
        const issueStore = db.createObjectStore('issues', { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        issueStore.createIndex('projectId', 'projectId', { unique: false });
        issueStore.createIndex('status', 'status', { unique: false });
        issueStore.createIndex('type', 'type', { unique: false });
        issueStore.createIndex('createdAt', 'createdAt', { unique: false });
        console.log('✅ Store "issues" creado');
      }

      console.log('✅ PASO 3.2 COMPLETADO: Esquema creado');
    };
  });
};

// 📂 OPERACIONES DE PROYECTOS

export const createProject = async (projectData) => {
  console.log('➕ PASO 3.3: Creando proyecto:', projectData.name);
  
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['projects'], 'readwrite');
    const store = transaction.objectStore('projects');
    
    const project = {
      ...projectData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const request = store.add(project);
    
    request.onsuccess = () => {
      const createdProject = { ...project, id: request.result };
      console.log('✅ PASO 3.3 COMPLETADO: Proyecto creado con ID:', request.result);
      resolve(createdProject);
    };
    
    request.onerror = () => {
      console.error('❌ Error creando proyecto:', request.error);
      reject(request.error);
    };
  });
};

export const getProjectsByUser = async (userEmail) => {
  console.log('📋 PASO 3.4: Obteniendo proyectos para:', userEmail);
  
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['projects'], 'readonly');
    const store = transaction.objectStore('projects');
    const index = store.index('userEmail');
    const request = index.getAll(userEmail);
    
    request.onsuccess = () => {
      console.log('✅ PASO 3.4 COMPLETADO: Proyectos encontrados:', request.result.length);
      resolve(request.result);
    };
    
    request.onerror = () => {
      console.error('❌ Error obteniendo proyectos:', request.error);
      reject(request.error);
    };
  });
};

export const updateProject = async (projectId, updates) => {
  console.log('✏️ PASO 3.5: Actualizando proyecto:', projectId);
  
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['projects'], 'readwrite');
    const store = transaction.objectStore('projects');
    const request = store.get(projectId);
    
    request.onsuccess = () => {
      const project = request.result;
      if (!project) {
        reject(new Error('Proyecto no encontrado'));
        return;
      }
      
      const updatedProject = {
        ...project,
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      const updateRequest = store.put(updatedProject);
      
      updateRequest.onsuccess = () => {
        console.log('✅ PASO 3.5 COMPLETADO: Proyecto actualizado');
        resolve(updatedProject);
      };
      
      updateRequest.onerror = () => {
        console.error('❌ Error actualizando proyecto:', updateRequest.error);
        reject(updateRequest.error);
      };
    };
    
    request.onerror = () => {
      console.error('❌ Error obteniendo proyecto:', request.error);
      reject(request.error);
    };
  });
};

export const deleteProject = async (projectId) => {
  console.log('🗑️ PASO 3.6: Eliminando proyecto:', projectId);
  
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['projects', 'issues'], 'readwrite');
    const projectStore = transaction.objectStore('projects');
    const issueStore = transaction.objectStore('issues');
    
    // Eliminar proyecto
    const projectRequest = projectStore.delete(projectId);
    
    // Eliminar issues asociados
    const issueIndex = issueStore.index('projectId');
    const issuesRequest = issueIndex.openCursor(IDBKeyRange.only(projectId));
    
    issuesRequest.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      }
    };
    
    transaction.oncomplete = () => {
      console.log('✅ PASO 3.6 COMPLETADO: Proyecto y sus issues eliminados');
      resolve(true);
    };
    
    transaction.onerror = () => {
      console.error('❌ Error eliminando proyecto:', transaction.error);
      reject(transaction.error);
    };
  });
};

// 🎯 OPERACIONES DE ISSUES

export const createIssue = async (issueData) => {
  console.log('➕ PASO 3.7: Creando issue:', issueData.title);
  
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['issues'], 'readwrite');
    const store = transaction.objectStore('issues');
    
    const issue = {
      ...issueData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const request = store.add(issue);
    
    request.onsuccess = () => {
      const createdIssue = { ...issue, id: request.result };
      console.log('✅ PASO 3.7 COMPLETADO: Issue creado con ID:', request.result);
      resolve(createdIssue);
    };
    
    request.onerror = () => {
      console.error('❌ Error creando issue:', request.error);
      reject(request.error);
    };
  });
};

export const getIssuesByProject = async (projectId) => {
  console.log('📋 PASO 3.8: Obteniendo issues para proyecto:', projectId);
  
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['issues'], 'readonly');
    const store = transaction.objectStore('issues');
    const index = store.index('projectId');
    const request = index.getAll(projectId);
    
    request.onsuccess = () => {
      console.log('✅ PASO 3.8 COMPLETADO: Issues encontrados:', request.result.length);
      resolve(request.result);
    };
    
    request.onerror = () => {
      console.error('❌ Error obteniendo issues:', request.error);
      reject(request.error);
    };
  });
};

export const updateIssue = async (issueId, updates) => {
  console.log('✏️ PASO 3.9: Actualizando issue:', issueId);
  
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['issues'], 'readwrite');
    const store = transaction.objectStore('issues');
    const request = store.get(issueId);
    
    request.onsuccess = () => {
      const issue = request.result;
      if (!issue) {
        reject(new Error('Issue no encontrado'));
        return;
      }
      
      const updatedIssue = {
        ...issue,
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      const updateRequest = store.put(updatedIssue);
      
      updateRequest.onsuccess = () => {
        console.log('✅ PASO 3.9 COMPLETADO: Issue actualizado');
        resolve(updatedIssue);
      };
      
      updateRequest.onerror = () => {
        console.error('❌ Error actualizando issue:', updateRequest.error);
        reject(updateRequest.error);
      };
    };
    
    request.onerror = () => {
      console.error('❌ Error obteniendo issue:', request.error);
      reject(request.error);
    };
  });
};

export const deleteIssue = async (issueId) => {
  console.log('🗑️ PASO 3.10: Eliminando issue:', issueId);
  
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['issues'], 'readwrite');
    const store = transaction.objectStore('issues');
    const request = store.delete(issueId);
    
    request.onsuccess = () => {
      console.log('✅ PASO 3.10 COMPLETADO: Issue eliminado');
      resolve(true);
    };
    
    request.onerror = () => {
      console.error('❌ Error eliminando issue:', request.error);
      reject(request.error);
    };
  });
};

console.log('✅ PASO 3 COMPLETADO: IndexedDB Manager configurado');