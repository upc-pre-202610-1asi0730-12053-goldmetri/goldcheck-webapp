import { BaseApi } from '../../shared/infrastructure/base-api.js'
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js'

class ConsumerApi extends BaseApi {
  #pieces

  constructor() {
    super()
    this.#pieces = new BaseEndpoint(this.http, '/consumerPieces')
  }

  getPieces(params)       { return this.#pieces.getAll(params) }
  getPieceById(id)        { return this.#pieces.getById(id) }
  linkPiece(data)         { return this.#pieces.create(data) }
  updatePiece(id, data)   { return this.#pieces.update(id, data) }
}

export const consumerApi = new ConsumerApi()
