import { Notification } from '../domain/model/notification.entity.js'

/**
 * Maps notification resources into domain entities.
 *
 * @class NotificationAssembler
 */
export class NotificationAssembler {
  /**
   * @param {Object} resource - Notification resource payload.
   * @returns {Notification} Notification entity.
   */
  static toEntityFromResource(resource) {
    return new Notification({
      id: resource.id, title: resource.title, message: resource.message,
      notificationType: resource.notificationType, recipientId: resource.recipientId,
      recipientSegment: resource.recipientSegment, isRead: resource.isRead || false,
      createdAt: resource.createdAt
    })
  }

  /**
   * Parses notification resources from a response and maps them into entities.
   *
   * @param {import('axios').AxiosResponse<Array<Object>|Object>} response - HTTP response with notification resources.
   * @returns {Notification[]} Notification entities.
   */
  static toEntitiesFromResponse(response) {
    if (response.status !== 200) {
      console.error(`${response.status}, ${response.statusText}`)
      return []
    }
    const resources = response.data instanceof Array ? response.data : response.data['notifications']
    return resources.map(resource => this.toEntityFromResource(resource))
  }
}
