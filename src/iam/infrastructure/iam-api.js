import { BaseApi } from '../../shared/infrastructure/base-api.js'

class IamApi extends BaseApi {
  constructor() {
    super()
  }

  signIn(username, password) {
    return this.http.post('/authentication/sign-in', { Username: username, Password: password })
  }

  signUp(data) {
    const segmentToRole = { mining: 'Operator', jewelry: 'Jeweler', consumer: 'Consumer' }
    return this.http.post('/authentication/sign-up', {
      Username: data.username,
      Password: data.password,
      Email:    data.email,
      Role:     segmentToRole[data.segment] || 'Operator'
    })
  }

  requestPasswordReset(email) {
    return this.http.post('/authentication/forgot-password', { Email: email })
  }

  resetPassword(token, newPassword) {
    return this.http.post('/authentication/reset-password', { Token: token, NewPassword: newPassword })
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
