import { BaseApi } from '../../shared/infrastructure/base-api.js'

class IamApi extends BaseApi {
  constructor() {
    super()
  }

  signIn(username, password) {
    return this.http.post('/authentication/sign-in', { username, password })
  }

  signUp(data) {
    return this.http.post('/authentication/sign-up', {
      username: data.username,
      password: data.password,
      email:    data.email,
      role:     data.segment
    })
  }

  getUserById(userId) {
    return this.http.get(`/users/${userId}`)
  }

  updateProfile(userId, data) {
    return this.http.put(`/users/${userId}/profile`, {
      username: data.username,
      email:    data.email
    })
  }
}

export const iamApi = new IamApi()
