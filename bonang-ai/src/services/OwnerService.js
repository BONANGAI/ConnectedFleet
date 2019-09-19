import aws from 'aws-sdk'
import AuthService from './AuthService'
import ConfigurationService from './ConfigurationService'

export default class OwnerService {
  constructor () {
    this.auth = AuthService.getInstance()
    this.config = ConfigurationService.getInstance()

    this.poolId = this.config.get('USER_POOL_ID')
    const credentials = this.auth.getCredentials()
    this.cognito = new aws.CognitoIdentityServiceProvider({
      region: this.config.get('AWS_REGION'),
      credentials
    })
  }

  listOwners () {
    const UserPoolId = this.poolId
    return new Promise((resolve, reject) => {
      this.cognito.listUsersInGroup({
        GroupName: 'owners',
        UserPoolId
      }, (err, data) => {
        if (err) {
          console.error('ERROR: Failed to list owners')
          reject(err)
        } else {
          resolve(data.Users)
        }
      })
    })
  }

  getUserByUuid (uuid) {
    return new Promise((resolve, reject) => {
      this.listOwners()
        .then(data => {
          resolve(data.filter(item => {
            const sub = item.Attributes.filter(i => i.Name === 'sub')[0].Value
            return uuid === sub
          })[0])
        })
        .catch(err => reject(err))
    })
  }

  static getInstance () {
    if (!OwnerService._instance) {
      OwnerService._instance = new OwnerService()
    }
    return OwnerService._instance
  }
}
