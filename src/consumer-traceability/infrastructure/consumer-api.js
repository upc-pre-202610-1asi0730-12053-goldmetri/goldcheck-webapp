import { MockBaseApi } from '../../shared/infrastructure/mock-base-api.js'

class ConsumerApi extends MockBaseApi {
  constructor() { super() }

  getPiecesByOwner(ownerId) {
    return this.http.get(`/consumerPieces?ownerId=${ownerId}`)
  }

  addPiece(piece) {
    return this.http.post('/consumerPieces', piece)
  }

  findByTraceabilityCode(code) {
    return this.http.get(`/consumerPieces?traceabilityCode=${encodeURIComponent(code)}`)
  }

  getCertificateById(certId) {
    return this.http.get(`/jewelryCertificates/${certId}`)
  }

  getJewelryItemBySku(sku) {
    return this.http.get(`/jewelryItems?sku=${encodeURIComponent(sku)}`)
  }
}

export const consumerApi = new ConsumerApi()
