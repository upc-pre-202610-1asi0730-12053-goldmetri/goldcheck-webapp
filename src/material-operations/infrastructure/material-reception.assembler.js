import { MaterialReception } from '../domain/model/material-reception.entity.js'

export class MaterialReceptionAssembler {
  static toEntityFromResource(resource) {
    const batchId    = resource.batchId    ?? resource.BatchId    ?? ''
    const payloadTons = resource.payloadTons ?? resource.PayloadTons ?? 0
    const mineralType = resource.mineralType ?? resource.MineralType ?? ''
    const status      = resource.status      ?? resource.Status      ?? ''
    const finalWeight = resource.finalWeightTons ?? resource.FinalWeightTons ?? null
    const shrinkage   = resource.shrinkagePercent ?? resource.ShrinkagePercent ?? null
    return new MaterialReception({
      id:               resource.id ?? resource.Id,
      batchId,
      batchCode:        batchId,
      receivedWeight:   finalWeight ?? payloadTons,
      initialWeight:    payloadTons,
      shrinkagePercent: shrinkage,
      mineralType,
      purityKarats:     null,
      status,
      operatorId:       null,
      receivedAt:       null
    })
  }

  static toEntitiesFromResponse(response) {
    if (response.status !== 200) return []
    const resources = Array.isArray(response.data) ? response.data : []
    return resources.map(r => this.toEntityFromResource(r))
  }

  static toResourceFromEntity(entity) {
    return {
      batchId:     entity.batchId,
      mineralType: entity.mineralType,
      payloadTons: entity.receivedWeight
    }
  }
}
