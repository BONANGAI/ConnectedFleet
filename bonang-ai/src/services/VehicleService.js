import async from 'async'
import aws from 'aws-sdk'
import deviceSdk from 'aws-iot-device-sdk'
import AuthService from './AuthService'
import ConfigurationService from './ConfigurationService'

export default class VehicleService {
  constructor () {
    this.auth = AuthService.getInstance()
    this.config = ConfigurationService.getInstance()

    // FIXME Move this to config
    this.vehicleTableName = 'vehicleTable'
    this.vehicleTelemetryTable = 'vehicleTelemetryTable'
    this.vehicleOwnersTableName = 'vehicleDriversTable'

    const credentials = this.auth.getCredentials()
    this.dynamo = new aws.DynamoDB.DocumentClient({
      region: this.config.get('AWS_REGION'),
      credentials
    })
  }

  connect () {
    const credentials = this.auth.getCredentials()
    this.iot = new aws.IotData({
      endpoint: this.config.get('IOT_ENDPOINT'),
      region: this.config.get('AWS_REGION'),
      credentials
    })

    const req = {
      host: this.config.get('IOT_ENDPOINT'),
      protocol: 'wss',
      clientId: 'ui' + new Date().getTime(),
      accessKeyId: credentials.accessKeyId,
      secretKey: credentials.secretAccessKey,
      sessionToken: credentials.sessionToken
    }

    const device = deviceSdk.device(req)

    return device
  }

  associateVehicleToOwner (vin, user_uuid) {
    const TableName = this.vehicleOwnersTableName
    const Item = {
      vin,
      user_uuid
    }

    return new Promise((resolve, reject) => {
      // FIXME: this is writing to DynamoDB directly, not web API
      this.dynamo.put({
        TableName,
        Item
      }, (err, data) => {
        if (err) {
          console.error('ERROR: Failed to associate vehicle to owner')
          reject(err)
        } else {
          resolve(null)
        }
      })
    })
  }

  listOwnerships () {
    return new Promise((resolve, reject) => {
      // FIXME: this is calling DynamoDB directly, not web API
      this.dynamo.scan({ TableName: this.vehicleOwnersTableName }, (err, data) => {
        if (err) {
          console.error('ERROR: Failed to fetch ownership list')
          reject(err)
        } else {
          resolve(data.Items)
        }
      })
    })
  }

  listOwnedVehicles (driverUuid) {
    return new Promise((resolve, reject) => {
      async.waterfall([
        cb => {
          this.listOwnerships()
            .then(data => cb(null, data))
            .catch(err => cb(err))
        },
        (vehicleList, cb) => {
          // pick the right car for this driver, as passed in
          const myCar = vehicleList.find(function (car) {
            return car.user_uuid === driverUuid
          })
          const vin = myCar.vin
          console.log('listOwnedVehicles(): Selected VIN ' + vin + ' for user ' + driverUuid)

          if (!vin) {
            cb(null, [])
          } else {
            this.getVehicleInformation(vin)
              .then(data => cb(null, data))
              .catch(err => cb(err))
          }
        }
      ], (err, data) => {
        if (err) {
          console.error('ERROR: Failed to fetch owned vehicles')
          reject(err)
        } else {
          resolve(data)
        }
      })
    })
  }

  listVehicles () {
    return new Promise((resolve, reject) => {
      async.waterfall([
        cb => {
          // FIXME: this is calling DynamoDB directly, not web API
          this.dynamo.scan({ TableName: this.vehicleTableName }, (err, data) => {
            if (err) {
              console.error('ERROR: Failed to fetch vehicle list from vehicle table')
              cb(err)
            } else {
              cb(null, data.Items)
            }
          })
        },
        (items, cb) => {
          const params = {
            RequestItems: {}
          }

          params.RequestItems[this.vehicleTelemetryTable] = {
            Keys: items.map(item => ({ vin: item.vin }))
          }

          this.dynamo.batchGet(params, (err, data) => {
            if (err) {
              console.error('ERROR: Failed to fetch vehicle temeletry')
              cb(err)
            } else {
              const parsedItems = data.Responses[this.vehicleTelemetryTable].map(item => {
                const parsedItem = { ...item }
                const mainItem = items.filter(mi => mi.vin === parsedItem.vin)[0]
                for (let paramName in mainItem) {
                  parsedItem[paramName] = mainItem[paramName]
                }

                return parsedItem
              })
              cb(null, parsedItems)
            }
          })
        }
      ], (err, data) => {
        if (err) {
          console.error('ERROR: Failed to list vehicles')
          reject(err)
        } else {
          resolve(data)
        }
      })
    })
  }

  findVehicles (vin) {
    return new Promise((resolve, reject) => {
      // FIXME: this is calling DynamoDB directly, not web API
      this.dynamo.query({
        TableName: this.vehicleTableName,
        KeyConditionExpression: 'begins_with(vin, :input)',
        ExpressionAttributeValues: {
          ':input': vin
        }
      }, (err, data) => {
        if (err) {
          console.error('ERROR: Failed to find vehicle')
          reject(err)
        } else {
          resolve(data.Items)
        }
      })
    })
  }

  getVehicleInformation (vin, ownership) {
    return new Promise((resolve, reject) => {
      const actions = [
        cb => {
          // FIXME: this is calling DynamoDB directly, not web API
          this.dynamo.get({
            TableName: this.vehicleTableName,
            Key: {
              vin
            }
          }, (err, data) => {
            if (err) {
              console.error('ERROR: Failed to fetch vehicle information')
              cb(err)
            } else {
              cb(null, {
                ...data.Item
              })
            }
          })
        }
      ]

      //get the connected status from the shadow
      actions.push(cb => {
        this.getState(vin)
          .then(shadow => {
            //console.log('getVehicleInformation(): connected= ' + shadow.state.reported.connected)
            cb(null, shadow)
          })
          .catch(cause => {
            console.error(`ERROR: Failed to fetch vehicle state because of ${cause}.`)
          })
      })

      //caller also wants ownership info
      if (ownership) {
        actions.push(cb => {
          this.listOwnerships()
            .then(data => {
              cb(null, data.filter(item => item.vin === vin))
            })
            .catch(err => cb(err))
        })
      }

      async.parallel(actions, (err, data) => {
        if (err) {
          console.error('ERROR: Failed to fetch vehicle information')
          reject(err)
        } else {
          //core vehicle data from DDB
          const vehicle = data[0]

          //realtime data from shadow
          if (data[1].state.reported.connected && data[1].state.reported.connected.timestamp) {
            vehicle.status = data[1].state.reported.connected
            vehicle.statusLastUpdated = data[1].metadata.reported.connected.timestamp
          }

          //ownership data from DDB if requested
          const ownershipData = data[2]
          if (ownershipData) {
            vehicle.owner = ownershipData[0].user_uuid
          }

          resolve(vehicle)
        }
      })
    })
  }

  getState (thingName) {
    console.log('getState(' + thingName + ') invoked - getting shadow')
    if (this.iot == null) {
      //console.log('getState(' + thingName + '): connecting to AWS IoT...')
      this.connect()
    }

    return new Promise((resolve, reject) => {
      this.iot.getThingShadow({
        thingName
      }, (err, data) => {
        if (err) {
          reject(err)
        } else {
          console.log('getState(): shadow=' + data.payload)
          const jsonPayload = JSON.parse(data.payload)
          resolve(jsonPayload)
        }
      })
    })
  }

  static getInstance () {
    if (!VehicleService._instance) {
      VehicleService._instance = new VehicleService()
    }
    return VehicleService._instance
  }
}
