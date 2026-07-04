import { BaseApi } from '../../shared/infrastructure/base-api.js'

class MaterialOperationsApi extends BaseApi {
  constructor() {
    super()
  }

  getAllMaterials(reporterId) {
    return this.http.get('/materials', { params: reporterId ? { reporterId } : {} })
  }

  getMaterialById(batchId) {
    return this.http.get(`/materials/${batchId}`)
  }

  identifyMineralType(batchId, mineralType, payloadTons, reporterId) {
    return this.http.post('/materials', { BatchId: batchId, MineralType: mineralType, PayloadTons: payloadTons, ReporterId: reporterId })
  }

  classifyMaterial(batchId, classification) {
    return this.http.put(`/materials/${batchId}/classify`, { Classification: classification })
  }

  changeMineralType(batchId, mineralType) {
    return this.http.put(`/materials/${batchId}/mineral-type`, { MineralType: mineralType })
  }

  calculateShrinkage(batchId, finalWeightTons) {
    return this.http.put(`/materials/${batchId}/shrinkage`, { FinalWeightTons: finalWeightTons })
  }

  downloadMaterial(batchId, dumpingPoint) {
    return this.http.put(`/materials/${batchId}/download`, { DumpingPoint: dumpingPoint })
  }

  trackMaterialMovement(batchId, currentLocation) {
    return this.http.put(`/materials/${batchId}/track`, { CurrentLocation: currentLocation })
  }
}

export const materialOperationsApi = new MaterialOperationsApi()
