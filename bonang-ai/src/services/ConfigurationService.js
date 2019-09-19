import { ConfigService } from 'aws-sdk'
import DefaultConfig from '@/assets/config.json'

export default class ConfigurationService {
  static ITEM_DOES_NOT_EXIST_EXCEPTION = new Error('ITEM_DOES_NOT_EXIST')
  static ITEM_ALREADY_EXISTS_EXCEPTION = new Error('ITEM_ALREADY_EXISTS')

  constructor () {
    this.data = DefaultConfig
  }

  get (item) {
    const value = this.data[item]
    if (!value) {
      throw ConfigurationService.ITEM_DOES_NOT_EXIST_EXCEPTION
    }

    return value
  }

  set (item, value, overwrite = false) {
    const existing = this.data[item]
    if (existing !== undefined && !overwrite) {
      throw ConfigService.ITEM_ALREADY_EXISTS_EXCEPTION
    }

    this.data[item] = value

    return this.get(item)
  }

  static getInstance () {
    if (!ConfigurationService._instance) ConfigurationService._instance = new ConfigurationService()
    return ConfigurationService._instance
  }
}
