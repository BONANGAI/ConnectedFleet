import aws from 'aws-sdk'
import jwtDecode from 'jwt-decode'
import ConfigurationService from './ConfigurationService'

export default class AuthService {
  constructor () {
    this.config = ConfigurationService.getInstance()

    this.customDomain = this.config.get('COGNITO_CUSTOM_DOMAIN')
    this.poolId = this.config.get('USER_POOL_ID')
    this.poolClientId = this.config.get('USER_POOL_CLIENT_ID')
    this.idPoolId = this.config.get('IDENTITY_POOL_ID')

    const region = this.awsRegion = this.config.get('AWS_REGION')
    this.cognito = new aws.CognitoIdentity({
      region
    })

    this.credentials = null
  }

  decodeToken (token) {
    const decoded = jwtDecode(token)
    this.user = decoded['cognito:username']
    this.groups = decoded['cognito:groups']
    this.group = this.groups[0]
    this.role = decoded['cognito:preferred_role']
    this.sub = decoded['sub']
    this.userToken = decoded
  }

  getCredentials () {
    if (!this.credentials) {
      this.login()
      return undefined
    }

    return {
      accessKeyId: this.credentials.Credentials.AccessKeyId,
      secretAccessKey: this.credentials.Credentials.SecretKey,
      sessionToken: this.credentials.Credentials.SessionToken
    }
  }

  login () {
    window.location.href = `https://${this.customDomain}.auth.${this.awsRegion}.amazoncognito.com/login?response_type=token&client_id=${this.poolClientId}&redirect_uri=${encodeURIComponent(window.location.href.split('#')[0])}`
  }

  getLogoutUrl () {
    return `https://${this.customDomain}.auth.${this.awsRegion}.amazoncognito.com/logout?response_type=token&client_id=${this.poolClientId}&redirect_uri=${encodeURIComponent(window.location.href.split('#')[0])}`
  }

  postAuth (token) {
    this.decodeToken(token)
    const AccountId = this.config.get('AWS_ACCOUNT_ID')
    const Logins = {}
    Logins[`cognito-idp.${this.awsRegion}.amazonaws.com/${this.poolId}`] = token
    const req = {
      IdentityPoolId: this.idPoolId,
      AccountId,
      Logins
    }

    return new Promise((resolve, reject) => {
      this.cognito.getId(req, (err, data) => {
        if (err) {
          console.error(err)
          console.error('ERROR: Failed to authenticate.')
          reject(err)
        } else {
          console.log('INFO: Successfully authenticated.')
          const { IdentityId } = data
          this.cognito.getCredentialsForIdentity({
            IdentityId,
            Logins
          }, (err, creds) => {
            if (err) {
              console.error('Failed to get credentials')
              reject(err)
            } else {
              console.log('INFO: Successfully fetched credentials.')
              aws.config.credentials = creds
              this.credentials = creds
              resolve(creds)
            }
          })
        }
      })
    })
  }

  /**
   * @method getInstance
   * @static
   * Singleton implementation. Returns the current instance of the AuthService, or creates one if it does not exist
   * @return AuthService
   */
  static getInstance () {
    if (!AuthService._instance) AuthService._instance = new AuthService()
    return AuthService._instance
  }
}
