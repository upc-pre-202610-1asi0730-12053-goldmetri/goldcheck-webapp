import { MaterialReception } from '../domain/model/material-reception.entity.js'

export class MaterialReceptionAssembler {
  static toEntityFromResource(resource) {
    const batchId    = resource.batchId    ?? resource.BatchId    ?? ''
    const payloadTons = resource.payloadTons ?? resource.PayloadTons ?? 0
    const mineralType = resource.mineralType ?? resource.MineralType ?? ''
    const status      = resource.status      ?? resource.Status      ?? ''
    return new MaterialReception({
      id:               resource.id ?? resource.Id,
      batchId,
      batchCode:        batchId,
      receivedWeight:   payloadTons,
      initialWeight:    payloadTons,
      shrinkagePercent: 0,
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
