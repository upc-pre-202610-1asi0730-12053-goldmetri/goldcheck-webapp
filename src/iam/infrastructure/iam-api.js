import { BaseApi } from '../../shared/infrastructure/base-api.js'
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js'

class IamApi extends BaseApi {
  #users

  constructor() {
    super()
    this.#users = new BaseEndpoint(this.http, '/users')
  }

  // US08 – Login (mock: buscar por email, password no persiste en json-server)
  async login(email, password) {
    const res = await this.#users.getAll({ email })
    return res
  }

  // US06 / US07 – Register (POST /users)
  register(data) {
    return this.#users.create(data)
  }

  // TS03 – Get profile
  getProfile(id) {
    return this.#users.getById(id)
  }

  // US10 – Update profile
  updateProfile(id, data) {
    return this.#users.patch(id, data)
  }
}

export const iamApi = new IamApi()
