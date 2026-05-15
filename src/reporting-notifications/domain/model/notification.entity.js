import { BaseEntity } from '../../../shared/domain/model/base-entity.js';

/**
 * Notification entity within the Reporting & Notifications bounded context.
 * Represents a system notification sent to a user or segment.
 *
 * @class Notification
 * @extends BaseEntity
 */
export class Notification extends BaseEntity {
  /**
   * @type {string}
   * @private
   */
  #title;
  /**
   * @type {string}
   * @private
   */
  #message;
  /**
   * @type {string}
   * @private
   */
  #notificationType;
  /**
   * @type {?number}
   * @private
   */
  #recipientId;
  /**
   * @type {string}
   * @private
   */
  #recipientSegment;
  /**
   * @type {boolean}
   * @private
   */
  #isRead;
  /**
   * @type {string}
   * @private
   */
  #createdAt;

  /**
   * @param {Object} [params={}] - Entity attributes.
   * @param {?number} [params.id=null] - Notification identifier.
   * @param {string} [params.title=''] - Short notification title.
   * @param {string} [params.message=''] - Full notification body.
   * @param {string} [params.notificationType=''] - Notification category ('ALERTA' | 'REPORTE' | 'INFO' | 'CRITICO').
   * @param {?number} [params.recipientId=null] - Foreign key of the target user.
   * @param {string} [params.recipientSegment=''] - Target segment when broadcasting.
   * @param {boolean} [params.isRead=false] - Whether the recipient has read the notification.
   * @param {?string} [params.createdAt=null] - ISO creation timestamp.
   */
  constructor({
    id = null, title = '', message = '', notificationType = '',
    recipientId = null, recipientSegment = '', isRead = false, createdAt = null
  } = {}) {
    super({ id });
    this.#title            = title;
    this.#message          = message;
    this.#notificationType = notificationType;
    this.#recipientId      = recipientId;
    this.#recipientSegment = recipientSegment;
    this.#isRead           = isRead;
    this.#createdAt        = createdAt || new Date().toISOString()
  }

  /** @returns {string}  */ get title()            { return this.#title; }
  /** @returns {string}  */ get message()          { return this.#message; }
  /** @returns {string}  */ get notificationType() { return this.#notificationType; }
  /** @returns {?number} */ get recipientId()      { return this.#recipientId; }
  /** @returns {string}  */ get recipientSegment() { return this.#recipientSegment; }
  /** @returns {boolean} */ get isRead()           { return this.#isRead; }
  /** @returns {string}  */ get createdAt()        { return this.#createdAt; }

  /**
   * Creates a new Notification with the given property overrides.
   * @param {Object} [changes={}]
   * @returns {Notification}
   */
  clone(changes = {}) {
    return new Notification({
      id: this.id, title: this.#title, message: this.#message,
      notificationType: this.#notificationType, recipientId: this.#recipientId,
      recipientSegment: this.#recipientSegment, isRead: this.#isRead,
      createdAt: this.#createdAt, ...changes
    });
  }
}
