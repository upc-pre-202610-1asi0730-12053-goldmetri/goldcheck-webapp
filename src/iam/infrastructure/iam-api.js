import { BaseApi } from '../../shared/infrastructure/base-api.js'

class IamApi extends BaseApi {
  constructor() {
    super()
  }

  signIn(username, password) {
    return this.http.post('/authentication/sign-in', { username, password })
  }

  signUp(data) {
    const segmentToRole = { mining: 'Operator', jewelry: 'Jeweler', consumer: 'Consumer' }
    return this.http.post('/authentication/sign-up', {
      username: data.username,
      password: data.password,
      email:    data.email,
      role:     segmentToRole[data.segment] || 'Operator'
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
