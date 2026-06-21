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
    const id            = resource.id            ?? resource.Id
    const vehicleId     = resource.vehicleId     ?? resource.VehicleId     ?? ''
    const loadingPoint  = resource.loadingPoint  ?? resource.LoadingPoint  ?? ''
    const dumpingPoint  = resource.dumpingPoint  ?? resource.DumpingPoint  ?? ''
    const payload       = resource.payload       ?? resource.Payload
    const status        = resource.status        ?? resource.Status        ?? ''
    return new MineralBatch({
      id,
      batchCode:     `HC-${id}`,
      vehicleId,
      vehicleName:   vehicleId,
      depositName:   loadingPoint,
      destination:   dumpingPoint,
      initialWeight: payload ?? 0,
      status:        STATUS_MAP[status] || status,
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
