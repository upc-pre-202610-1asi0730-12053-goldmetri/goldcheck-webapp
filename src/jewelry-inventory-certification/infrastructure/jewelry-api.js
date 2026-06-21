import { MockBaseApi } from '../../shared/infrastructure/mock-base-api.js'

class JewelryApi extends MockBaseApi {
  constructor() { super() }

  getAllItems() {
    return this.http.get('/jewelryItems')
  }

  getItemById(id) {
    return this.http.get(`/jewelryItems/${id}`)
  }

  registerItem(data) {
    return this.http.post('/jewelryItems', {
      ...data,
      status: 'Pendiente',
      createdAt: new Date().toISOString()
    })
  }

  updateItemStatus(id, status) {
    return this.http.patch(`/jewelryItems/${id}`, { status })
  }

  getAllCertificates() {
    return this.http.get('/jewelryCertificates')
  }

  getCertificateById(certId) {
    return this.http.get(`/jewelryCertificates/${certId}`)
  }

  getCertificateByItemId(itemId) {
    return this.http.get(`/jewelryCertificates?itemId=${itemId}`)
  }

  createCertificate(data) {
    return this.http.post('/jewelryCertificates', {
      ...data,
      issuerName: 'GoldMetrics Cert Authority',
      issueDate:  new Date().toISOString(),
      status:     'Activo'
    })
  }
}

export const jewelryApi = new JewelryApi()
