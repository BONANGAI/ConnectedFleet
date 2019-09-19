<template>
  <div class="overview">
    <vehicle-status :vehicle="vehicle"/>
  </div>
</template>

<script>
import async from 'async'
import VehicleStatus from '@/components/VehicleStatus'
import AuthService from '@/services/AuthService'
import ConfigurationService from '@/services/ConfigurationService'
import VehicleService from '@/services/VehicleService'

export default {
  name: 'overview',
  components: {
    VehicleStatus
  },
  created () {
    this.auth = AuthService.getInstance()
    this.config = ConfigurationService.getInstance()
    this.vehicleService = VehicleService.getInstance()
    this.fetchData()
  },
  data () {
    return {
      vehicle: {
        battery_hv_level: 0
      }
    }
  },
  methods: {
    fetchData () {
      async.waterfall([
        cb => {
          const sub = this.auth.sub
          this.vehicleService.listOwnedVehicles(sub)
            .then(data => cb(null, data))
            .catch(err => cb(err))
        },
        (vehicle, cb) => {
          const vin = vehicle.vin
          const vehicleDevice = this.vehicleService.connect()
          vehicleDevice.on('connect', () => {
            console.log('fetchData(): Connected to MQTT')
            vehicleDevice.subscribe(`$aws/things/${vin}/shadow/update/accepted`)
          })

          vehicleDevice.on('error', () => {
            console.error('ERROR: Failed to connect to MQTT')
          })

          vehicleDevice.on('message', (topic, payload) => {
            console.log('fetchData(): Status change received.')
            const newState = JSON.parse(payload)
            if (newState.state && newState.state.reported && newState.state.reported.battery_hv_level) {
              this.vehicle = newState.state.reported
            }
          })

          this.vehicleService.getState(vin)
            .then(data => {
              this.vehicle = data.state.reported
            })
            .catch(cause => {
              console.error(`ERROR: Failed to fetch vehicle state because of ${cause}.`)
            })
        }
      ], (err, data) => {
        if (err) {
          console.error('ERROR: Failed to fetch vehicle information')
          console.error(err)
        }
      })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.overview {
    height: 100%;
    display: block;
}

</style>
