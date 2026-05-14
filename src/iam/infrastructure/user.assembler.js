import { User } from '../domain/model/user.entity.js'

export class UserAssembler {
  static toEntity(resource) {
    // Normaliza tanto el formato nuevo (username, segment lowercase)
    // como el formato OpalTrace (firstName/lastName, segment uppercase, planTier)
    const username = resource.username
      || [resource.firstName, resource.lastName].filter(Boolean).join(' ')
      || resource.companyName
      || resource.email

    const rawSegment = resource.segment || ''
    const segment = rawSegment.toLowerCase()

    const plan = resource.plan || resource.planTier || 'BRONZE'

    return new User({
      id:          resource.id,
      email:       resource.email,
      username,
      phoneNumber: resource.phoneNumber || resource.phone_number || '',
      segment,
      plan,
      location:    resource.location || ''
    })
  }

  static toResource(user) {
    return {
      email:       user.email,
      username:    user.username,
      phoneNumber: user.phoneNumber,
      segment:     user.segment,
      plan:        user.plan,
      location:    user.location
    }
  }
}
