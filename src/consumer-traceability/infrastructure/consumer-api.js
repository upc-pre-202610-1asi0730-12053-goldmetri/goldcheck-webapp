import { BaseApi } from '../../shared/infrastructure/base-api.js'
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js'

class ConsumerApi extends BaseApi {
  #pieces
  #certs
  #jewelry
  #batches

  constructor() {
    super()
    this.#pieces   = new BaseEndpoint(this.http, '/consumerPieces')
    this.#certs    = new BaseEndpoint(this.http, '/jewelryCertificates')
    this.#jewelry  = new BaseEndpoint(this.http, '/jewelryItems')
    this.#batches  = new BaseEndpoint(this.http, '/mineralBatches')
  }

  getPieces(params)        { return this.#pieces.getAll(params) }
  getPieceById(id)         { return this.#pieces.getById(id) }
  linkPiece(data)          { return this.#pieces.create(data) }
  updatePiece(id, data)    { return this.#pieces.update(id, data) }
  getCertificates(params)  { return this.#certs.getAll(params) }
  getJewelryItem(sku)      { return this.#jewelry.getAll({ sku }) }
  getBatchByCode(code)     { return this.#batches.getAll({ batchCode: code }) }
}

export const consumerApi = new ConsumerApi()
