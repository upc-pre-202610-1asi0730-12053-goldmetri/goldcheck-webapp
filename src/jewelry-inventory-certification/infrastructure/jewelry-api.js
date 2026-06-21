import { BaseApi } from '../../shared/infrastructure/base-api.js'

class JewelryApi extends BaseApi {
  constructor() { super() }

  getAllMaterials() {
    return this.http.get('/jewelry-materials')
  }

  registerMaterial(materialId, jewelerId) {
    return this.http.post('/jewelry-materials', { MaterialId: materialId, JewelerId: jewelerId })
  }

  scanQR(materialId, qrCode) {
    return this.http.put(`/jewelry-materials/${materialId}/scan`, { QRCode: qrCode })
  }

  generateCertificate(materialId) {
    return this.http.post('/certificates', { MaterialId: materialId })
  }

  signCertificate(certificateId, jewelerId) {
    return this.http.put(`/certificates/${certificateId}/sign`, { JewelerId: jewelerId })
  }

  getCertificateById(certificateId) {
    return this.http.get(`/certificates/${certificateId}`)
  }

  async getBatchByCode(batchCode) {
    const res = await this.http.get(`/materials/${batchCode}`)
    const m   = res.data
    if (!m) return { data: [] }
    return {
      data: [{
        batchCode:     m.batchId,
        mineralType:   m.mineralType,
        initialWeight: m.payloadTons,
        finalWeight:   m.payloadTons,
        status:        m.status === 'Identified' ? 'Completado' : 'En Tránsito',
        depositName:   'Mina GoldMetrics',
        vehicleName:   'Vehículo de Transporte',
        createdAt:     m.createdAt || new Date().toISOString()
      }]
    }
  }
}

export const jewelryApi = new JewelryApi()
