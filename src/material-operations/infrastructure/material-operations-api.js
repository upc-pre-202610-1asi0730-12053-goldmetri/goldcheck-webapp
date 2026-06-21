import { BaseApi } from '../../shared/infrastructure/base-api.js'

class MaterialOperationsApi extends BaseApi {
  constructor() {
    super()
  }

  getAllMaterials() {
    return this.http.get('/materials')
  }

  getMaterialById(batchId) {
    return this.http.get(`/materials/${batchId}`)
  }

  // US16 – Identify and register a mineral batch
  identifyMineralType(batchId, mineralType, payloadTons) {
    return this.http.post('/materials', { batchId, mineralType, payloadTons })
  }

  // US16 – Classify material batch
  classifyMaterial(batchId, classification) {
    return this.http.put(`/materials/${batchId}/classify`, { classification })
  }

  // US20 – Confirm arrival at dumping point
  downloadMaterial(batchId, dumpingPoint) {
    return this.http.put(`/materials/${batchId}/download`, { dumpingPoint })
  }

  // US21 – Track material movement / final weighing location
  trackMaterialMovement(batchId, currentLocation) {
    return this.http.put(`/materials/${batchId}/track`, { currentLocation })
  }
}

export const materialOperationsApi = new MaterialOperationsApi()
