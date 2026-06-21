import { MaterialReception } from '../domain/model/material-reception.entity.js'

export class MaterialReceptionAssembler {
  static toEntityFromResource(resource) {
    return new MaterialReception({
      id:               resource.id,
      batchId:          resource.batchId,
      batchCode:        resource.batchId,
      receivedWeight:   resource.payloadTons  || 0,
      initialWeight:    resource.payloadTons  || 0,
      shrinkagePercent: 0,
      mineralType:      resource.mineralType,
      purityKarats:     null,
      status:           resource.status,
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
