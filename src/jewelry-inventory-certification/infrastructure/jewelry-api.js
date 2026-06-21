import { BaseApi } from '../../shared/infrastructure/base-api.js'

class JewelryApi extends BaseApi {
  constructor() {
    super()
  }

  // Jewelry Materials
  getAllMaterials() {
    return this.http.get('/jewelry-materials')
  }

  getMaterialById(materialId) {
    return this.http.get(`/jewelry-materials/${materialId}`)
  }

  registerMaterial(materialId, jewelerId) {
    return this.http.post('/jewelry-materials', { materialId, jewelerId })
  }

  scanQR(materialId, qrCode) {
    return this.http.put(`/jewelry-materials/${materialId}/scan`, { qrCode })
  }

  // Certificates
  generateCertificate(materialId) {
    return this.http.post('/certificates', { materialId })
  }

  getCertificateById(certificateId) {
    return this.http.get(`/certificates/${certificateId}`)
  }

  signCertificate(certificateId, jewelerSignature) {
    return this.http.put(`/certificates/${certificateId}/sign`, { jewelerSignature })
  }
}

export const jewelryApi = new JewelryApi()
