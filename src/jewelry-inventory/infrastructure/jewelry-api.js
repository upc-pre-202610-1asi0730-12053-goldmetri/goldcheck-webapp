import { BaseApi } from '../../shared/infrastructure/base-api.js'
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js'

class JewelryApi extends BaseApi {
  #items
  #certificates

  constructor() {
    super()
    this.#items        = new BaseEndpoint(this.http, '/jewelryItems')
    this.#certificates = new BaseEndpoint(this.http, '/jewelryCertificates')
  }

  getItems(params)            { return this.#items.getAll(params) }
  getItemById(id)             { return this.#items.getById(id) }
  createItem(data)            { return this.#items.create(data) }
  updateItemStatus(id, status){ return this.#items.patch(id, { status }) }
  validateItem(id)            { return this.#items.patch(id, { status: 'Validado' }) }

  getCertificates(params)     { return this.#certificates.getAll(params) }
  createCertificate(data)     { return this.#certificates.create(data) }
}

export const jewelryApi = new JewelryApi()
