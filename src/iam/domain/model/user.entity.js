import { BaseEntity } from '../../../shared/domain/model/base-entity.js'

export class User extends BaseEntity {
  constructor({ id = null, email = '', username = '', phoneNumber = '', segment = 'mining', plan = 'BRONZE', location = '' } = {}) {
    super({ id })
    this.email       = email
    this.username    = username
    this.phoneNumber = phoneNumber
    this.segment     = segment   // 'mining' | 'jewelry' | 'consumer'
    this.plan        = plan      // 'BRONZE' | 'GOLD' | 'PLATINUM'
    this.location    = location
  }
}
