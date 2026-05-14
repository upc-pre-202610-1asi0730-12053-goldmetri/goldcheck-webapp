import { MaterialReception } from '../domain/model/material-reception.entity.js'

export class MaterialReceptionAssembler {
  static toEntity(r) {
    return new MaterialReception({
      id: r.id, batchId: r.batchId || r.id, batchCode: r.batchCode || '',
      receivedWeight: r.finalWeight || 0,
      initialWeight: r.initialWeight || 0,
      shrinkagePercent: r.shrinkagePercent || 0,
      mineralType: r.mineralType, purityKarats: r.purityKarats,
      status: r.status, operatorId: r.operatorId,
      receivedAt: r.createdAt
    })
  }

  static toEntities(response) {
    return (response.data || []).map(r => this.toEntity(r))
  }

  static toResource(entity) {
    return {
      batchId: entity.batchId, batchCode: entity.batchCode,
      finalWeight: entity.receivedWeight,
      shrinkagePercent: entity.shrinkagePercent,
      mineralType: entity.mineralType, purityKarats: entity.purityKarats,
      status: entity.status
    }
  }
}
