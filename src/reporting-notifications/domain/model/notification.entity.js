import { BaseEntity } from '../../../shared/domain/model/base-entity.js'

export class Notification extends BaseEntity {
  constructor({
    id = null,
    title = '',
    message = '',
    notificationType = '',
    recipientId = null,
    recipientSegment = '',
    isRead = false,
    createdAt = null
  } = {}) {
    super({ id })
    this.title            = title
    this.message          = message
    this.notificationType = notificationType  // 'ALERTA' | 'REPORTE' | 'INFO' | 'CRITICO'
    this.recipientId      = recipientId
    this.recipientSegment = recipientSegment
    this.isRead           = isRead
    this.createdAt        = createdAt || new Date().toISOString()
  }
}
