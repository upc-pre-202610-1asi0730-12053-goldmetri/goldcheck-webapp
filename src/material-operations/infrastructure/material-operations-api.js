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

  identifyMineralType(batchId, mineralType, payloadTons) {
    return this.http.post('/materials', { BatchId: batchId, MineralType: mineralType, PayloadTons: payloadTons })
  }

  classifyMaterial(batchId, classification) {
    return this.http.put(`/materials/${batchId}/classify`, { Classification: classification })
  }

  downloadMaterial(batchId, dumpingPoint) {
    return this.http.put(`/materials/${batchId}/download`, { DumpingPoint: dumpingPoint })
  }

  trackMaterialMovement(batchId, currentLocation) {
    return this.http.put(`/materials/${batchId}/track`, { CurrentLocation: currentLocation })
  }
}

export const materialOperationsApi = new MaterialOperationsApi()
