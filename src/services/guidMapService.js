class GuidMapService {
  constructor() {
    this.guidToIds = new Map();
    this.idsToGuid = new Map();
  }

  addMapping(guid, modelId, instanceId) {
    if (!guid) return;
    const key = `${modelId}:${instanceId}`;
    this.guidToIds.set(guid, { modelId, instanceId });
    this.idsToGuid.set(key, guid);
  }

  getByGuid(guid) {
    return this.guidToIds.get(guid) || null;
  }

  getByExpressId(modelId, instanceId) {
    const key = `${modelId}:${instanceId}`;
    return this.idsToGuid.get(key) || null;
  }

  hasGuid(guid) {
    return this.guidToIds.has(guid);
  }

  getAllGuids() {
    return Array.from(this.guidToIds.keys());
  }

  clear() {
    this.guidToIds.clear();
    this.idsToGuid.clear();
  }

  get size() {
    return this.guidToIds.size;
  }
}

let instance = null;

export const getGuidMap = () => {
  if (!instance) {
    instance = new GuidMapService();
  }
  return instance;
};

export const resetGuidMap = () => {
  instance = null;
};
