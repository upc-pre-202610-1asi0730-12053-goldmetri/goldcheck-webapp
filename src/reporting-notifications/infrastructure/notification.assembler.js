import { Notification } from '../domain/model/notification.entity.js'

export class NotificationAssembler {
  static toEntity(r) {
    return new Notification({
      id: r.id, title: r.title, message: r.message,
      notificationType: r.notificationType, recipientId: r.recipientId,
      recipientSegment: r.recipientSegment, isRead: r.isRead || false,
      createdAt: r.createdAt
    })
  }

  static toEntities(response) {
    return (response.data || []).map(r => this.toEntity(r))
  }
}
