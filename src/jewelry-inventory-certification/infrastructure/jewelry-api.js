import { BaseApi } from '../../shared/infrastructure/base-api.js'

class JewelryApi extends BaseApi {
  constructor() { super() }

  getAllMaterials(jewelerId) {
    return this.http.get('/jewelry-materials', { params: jewelerId ? { jewelerId } : {} })
  }

  registerMaterial(materialId, jewelerId, declaredKarats, massGrams) {
    return this.http.post('/jewelry-materials', {
      MaterialId: materialId, JewelerId: jewelerId, DeclaredKarats: declaredKarats, MassGrams: massGrams
    })
  }

  scanQR(materialId, qrCode) {
    return this.http.put(`/jewelry-materials/${materialId}/scan`, { QRCode: qrCode })
  }

  // US24 – Registro de Prueba de Pureza
  registerPurityTest(materialId, verifiedKarats) {
    return this.http.put(`/jewelry-materials/${materialId}/purity-test`, { VerifiedKarats: verifiedKarats })
  }

  // US25 – Subdivisión de Lote
  splitBatch(materialId, childMasses) {
    return this.http.post(`/jewelry-materials/${materialId}/split`, { ChildMasses: childMasses })
  }

  // US26 – Generación de Código QR
  generateQR(materialId) {
    return this.http.post(`/jewelry-materials/${materialId}/generate-qr`)
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
