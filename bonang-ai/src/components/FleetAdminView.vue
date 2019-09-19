<template>
  <div class="view cover fleet-admins">

    <!-- All vehicles -->
    <div class="section all-vehicles" v-if="$route.params.section === 'all-vehicles'">
      <div class="panel full">
        <div class="subpanel">
          <h1 class="title">All vehicles</h1>
          <div class="menu">
            <!---
            <div class="menu-item new-owner" v-on:click="provisionVehicle()">
              <button class="btn btn-link padding">
                <i class="fa fa-plus"></i>
                New owner
              </button>
            </div>
            --->
            <div class="menu-item" v-for="vehicle in vehicleList" v-bind:key="vehicle.vehicleId" v-on:mouseover="selectVehicle(vehicle)" v-on:mouseout="unselectVehicle(vehicle)" :class="{ selected: selectedVehicle === vehicle }">
              <span class="menu-item-title">
                <span class="item-code">#{{vehicle.vehicleId}}</span>
                <span class="item-name">{{vehicle.modelName}}</span>
              </span>
            </div>
          </div>
        </div>
        <div class="panel-content">
          <div class="content-section map active">
            <mapbox-map :locations="vehicleLocations" :selected-index="vehicleList.indexOf(selectedVehicle)" :selected-label="selectedVehicleLabel" :hover-index="selectIndex" :click-index="gotoVehicle" :initialZoom="8" :initialBoundsOffset="2"></mapbox-map>
          </div>
        </div>
      </div>
    </div>

    <!-- Vehicle provisioning -->
    <div class="section provision-vehicle" v-if="$route.params.section === 'provision-vehicle'">
      <div class="panel central">
        <h1 class="title">Provision new vehicle</h1>
        <div class="form vehicle-provisioning">
          <auto-complete label="Vehicle VIN number" :on-type="findVehicles" :on-select="selectVehicle" input-class="spaced"></auto-complete>
          <div class="well form-item" v-if="vehicle.vin">
            {{ vehicle.modelName }}, AB12XYZ
          </div>
          <auto-complete label="Customer name" :on-type="findOwners" :on-select="selectOwner"></auto-complete>
          <div class="form-actions">
            <button class="btn btn-primary btn-block" v-on:click="associateVehicleToOwner()">Next</button>
            <button class="btn btn-link btn-block" v-on:click="backToList()">Cancel</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Vehicle overview -->
    <vehicle-overview :fields="vehicleFields" :vehicle="vehicle" v-if="$route.params.section === 'vehicle-overview'"></vehicle-overview>

    <!-- Faults -->
    <div class="section faults" v-if="$route.params.section === 'faults'">
      <div class="fault-list-container content-section margined">
        <h2 class="section-title">
          All faults
        </h2>
        <fleet-faults :faults="faultList"></fleet-faults>
      </div>
    </div>

  </div>
</template>

<script>
import async from 'async'
import AutoComplete from '@/components/visual/AutoComplete'
import MapboxMap from '@/components/visual/MapboxGLMap'
import VehicleOverview from '@/components/sections/VehicleOverview'
//import FleetFaults from '@/components/visual/FleetFaults'
import OwnerService from '@/services/OwnerService'
import VehicleService from '@/services/VehicleService'
//import DtcService from '@/services/DtcService'

export default {
  name: 'fleetAdminView',
  components: {
    AutoComplete,
    MapboxMap,
    OwnerService,
    VehicleOverview,
    //FleetFaults
  },
  computed: {
    vehicleLocations () {
      return this.vehicleList.map(item => item.location)
    }
  },
  created () {
    this.ownerService = OwnerService.getInstance()
    this.vehicleService = VehicleService.getInstance()
    //this.dtcService = DtcService.getInstance()
    this.fetchData()
  },
  data () {
    return {
      faultList: [],
      owner: {},
      ownerList: {},
      vehicleList: [],
      vehicle: {},
      vehicleFields: [
        'vehicle_code'
      ],
      selectedVehicle: null,
      selectedVehicleIndex: -1,
      selectedVehicleLabel: ''
    }
  },
  methods: {
    associateVehicleToOwner () {
      const vehicle = this.vehicle
      const owner = this.owner
      const sub = owner.Attributes.filter(item => item.Name === 'sub')[0].Value
      this.vehicleService.associateVehicleToOwner(vehicle.vin, sub)
        .then(() => {
          this.$router.push('/fleet-admins/all-vehicles')
        })
        .catch(err => {
          console.error(err)
        })
    },
    backToList () {
      this.$router.push('/fleet-admins/all-vehicles')
    },
    fetchData () {
      this.vehicleService.listVehicles()
        .then(vehicles => {
          this.vehicleList = vehicles.sort((a, b) => a.vehicleId - b.vehicleId)
        })
        .catch(err => {
          console.error(err)
        })

      //this.dtcService.getAllDtcs()
      //  .then(data => {
      //    this.faultList = data
      //  })
      //  .catch(err => {
      //    console.error(err)
      //  })

      if (this.$route.params.section === 'vehicle-overview') {
        this.vehicleService.connect()
        // TODO Subscribe
        this.vehicle = {}
        const vin = this.$route.params.subsection

        async.parallel([
          cb => {
            this.vehicleService.getVehicleInformation(vin)
              .then(vehicle => {
                this.vehicle = vehicle
                cb(null, vehicle)
              })
              .catch(err => {
                cb(err)
              })
          },
          cb => {
            cb(null)
            // this.vehicleService.getState(vin)
            //   .then(data => {
            //     for (let paramName in data.state.reported) {
            //       this.vehicle[paramName] = vehicle[paramName]
            //     }
            //     cb(null)
            //   })
            //   .catch(err => {
            //     cb(err)
            //   })
          }
        ], (err, data) => {
          if (err) {
            console.error('ERROR: Failed to load vehicle overview')
            console.log(err)
          } else {
            console.log('INFO: Successfully fetched vehicle overview')
            this.$forceUpdate()
          }
        })
      }
    },
    provisionVehicle () {
      this.$router.push('/fleet-admins/provision-vehicle')
    },
    findOwners (regex, input) {
      return new Promise((resolve, reject) => {
        this.ownerService.listOwners()
          .then(data => {
            this.ownerList = data

            const filtered = data.filter(item => {
              const firstName = item.Attributes.filter(i => i.Name === 'given_name')[0].Value
              const lastName = item.Attributes.filter(i => i.Name === 'family_name')[0].Value
              return `${firstName} ${lastName}`.match(regex)
            })

            resolve(filtered.map(item => {
              const firstName = item.Attributes.filter(i => i.Name === 'given_name')[0].Value
              const lastName = item.Attributes.filter(i => i.Name === 'family_name')[0].Value
              return `${firstName} ${lastName}`
            }))
          })
          .catch(err => {
            console.error(err)
            reject(err)
          })
      })
    },
    selectOwner (owner) {
      this.owner = this.ownerList.filter(item => {
        const firstName = item.Attributes.filter(i => i.Name === 'given_name')[0].Value
        const lastName = item.Attributes.filter(i => i.Name === 'family_name')[0].Value
        return `${firstName} ${lastName}` === owner
      })[0]
    },
    findVehicles (regex, input) {
      return new Promise((resolve, reject) => {
        const allVehicles = this.vehicleList
        const vehicles = allVehicles.filter(item => item.vin.match(regex))
        resolve(vehicles.map(vehicle => vehicle.vin))
      })
    },
    selectIndex (index) {
      if (index === null) {
        this.unselectVehicle(this.selectedVehicle)
      } else {
        const vehicle = this.vehicleList[index]
        this.selectVehicle(vehicle)
      }
    },
    selectVehicle (vehicle) {
      this.selectedVehicle = vehicle
      this.selectedVehicleIndex = this.vehicleList.indexOf(vehicle)
      this.selectedVehicleLabel = `#${this.selectedVehicle.vehicleId}\t${this.selectedVehicle.modelName}`
    },
    unselectVehicle (vehicle) {
      if (this.selectedVehicle === vehicle) {
        this.selectedVehicle = null
        this.selectedVehicleIndex = -1
        this.selectedVehicleLabel = ''
      }
    },
    gotoVehicle (index) {
      this.selectIndex(index)
      this.vehicleOverview(this.selectedVehicle)
    },
    vehicleOverview (vehicle) {
      this.$router.push(`/fleet-admins/vehicle-overview/${vehicle.vin}`)
    }
  },
  watch: {
    $route (val) {
      this.fetchData()
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.view.fleet-admins {
  .view-toggler {
    position: absolute;
    top: 20px;
    right: 20px;

    &::before {
      content: 'View as:';
      margin-right: 1em;
    }
  }

  .vehicle-list-view {
    position: absolute !important;
    width: 100%;
    transition: opacity 0.5s ease-in-out;

    &:not(.active) {
      opacity: 0;
      z-index: 1;
    }

    &.active {
      opacity: 1;
      z-index: 2;
    }

    &.map {
      background: red;
      min-height: 400px;
    }
  }

  .menu {
    .menu-item {
      .item-code {
        float: left;
        margin-right: 1.5em;
        display: inline-block;
      }
    }
  }

  .padding {
    padding: 0em 0em;
    font-size: 1em;
  }

  .fault-list-container {
    padding: 2em;
  }
}

</style>
