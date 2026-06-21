import axios from 'axios'

export class MockBaseApi {
  #http

  constructor() {
    this.#http = axios.create({
      baseURL: 'http://localhost:3000',
      headers: { 'Content-Type': 'application/json' }
    })
  }

  get http() { return this.#http }
}
