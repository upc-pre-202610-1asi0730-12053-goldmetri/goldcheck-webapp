import { MineralBatch } from '../domain/model/mineral-batch.entity.js'

export class MineralBatchAssembler {
  static toEntity(r) {
    return new MineralBatch({
      id: r.id, batchCode: r.batchCode, depositId: r.depositId,
      depositName: r.depositName, vehicleId: r.vehicleId,
      vehicleName: r.vehicleName, driverId: r.driverId,
      initialWeight: r.initialWeight, finalWeight: r.finalWeight,
      mineralType: r.mineralType, status: r.status,
      destination: r.destination, createdAt: r.createdAt
    })
  }

  static toEntities(response) {
    return (response.data || []).map(r => this.toEntity(r))
  }

  static toResource(batch) {
    return {
      batchCode: batch.batchCode, depositId: batch.depositId,
      depositName: batch.depositName, vehicleId: batch.vehicleId,
      vehicleName: batch.vehicleName, initialWeight: batch.initialWeight,
      mineralType: batch.mineralType, status: batch.status,
      destination: batch.destination
    }
  }
}
