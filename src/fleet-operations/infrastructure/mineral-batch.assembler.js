import { MineralBatch } from '../domain/model/mineral-batch.entity.js'

const STATUS_MAP = {
  HaulingCycleStarted:   'Cargando',
  Started:               'Cargando',
  MaterialLoaded:        'En Tránsito',
  Loaded:                'En Tránsito',
  HaulingCycleCompleted: 'Completado',
  Completed:             'Completado',
  RouteProgressUpdated:  'En Tránsito'
}

export class MineralBatchAssembler {
  static toEntityFromResource(resource) {
    return new MineralBatch({
      id:            resource.id,
      batchCode:     `HC-${resource.id}`,
      vehicleId:     resource.vehicleId,
      vehicleName:   resource.vehicleId,
      depositName:   resource.loadingPoint,
      destination:   resource.dumpingPoint || '',
      initialWeight: resource.payload      || 0,
      status:        STATUS_MAP[resource.status] || resource.status,
      mineralType:   'Oro'
    })
  }

  static toEntitiesFromResponse(response) {
    if (response.status !== 200) return []
    const resources = Array.isArray(response.data) ? response.data : []
    return resources.map(r => this.toEntityFromResource(r))
  }

  static toResourceFromEntity(batch) {
    return {
      vehicleId:    batch.vehicleId,
      loadingPoint: batch.depositName,
      payloadTons:  batch.initialWeight
    }
  }
}
