<template>
  <div class="section vehicle-overview">
    <div class="panel full">
      <div class="subpanel" :class="{ slided: !!currentSubsection }">
        <h1 class="title">{{ pageTitle }}</h1>
        <div class="form vehicle-info active">
          <div class="form-item form-multi-col">
            <div class="form-item form-group">
              <label class="form-label">Vehicle</label>
              <span class="label form-input">
                {{ vehicle.modelName }}
              </span>
            </div>
            <div class="form-item form-group" v-if="fields.indexOf('vehicle_registration') !== -1">
              <label class="form-label">Registration</label>
              <span class="label form-input">
                HT21FXH
              </span>
            </div>
          </div>
          <div class="">
            <ConnectionStatus :iotStatus="this.status" :statusLastUpdated="this.statusLastUpdated"></ConnectionStatus>
          </div>
          <div class="form-item form-group">
            <label class="form-label">Battery</label>
            <battery-level :level="batteryLevel"></battery-level>
          </div>
        </div>
        <div class="menu">
          <div class="menu-item" :class="{ 'menu-collapsible': section.type === 'collapsible', 'active': currentSection === section.code }" v-for="section in sections" v-bind:key="section.name" v-if="!section.main" v-on:click="setSection(section)">
            <span class="menu-item-title">
              {{ section.name }}
            </span>
            <span class="menu-item-badges" v-if="section.data && section.data.alerts && section.data.alerts.length">
              <span class="badge badge-plain badge-danger">{{ section.data.alerts.length }}</span>
            </span>
          </div>
        </div>
      </div>
      <div class="subpanel sub" :class="{ slided: !!currentSubsection }">
        <div class="back" v-if="currentSection !== 'overview'" v-on:click="setSection('overview')">
          Overview
        </div>
        <h1 class="title">{{ sectionTitle }}</h1>
        <div class="menu">
          <menu-item :section="section" :all="availableSubsections" v-for="(section, index) in availableSubsections" v-bind:key="section.code" :click="setSection" :active="currentSubsection === section.code"></menu-item>
        </div>
      </div>
      <div class="panel-content">
        <div class="content-section map" :class="{ active: currentSection === 'overview' }">
          <mapbox-map :locations="[vehicleLocation]" :initialZoom="14" :initialBoundsOffset="0.01"></mapbox-map>
        </div>
        <div class="content-section vehicle-health scroll" :class="{ active: currentSection === 'vehicle-health' }">
          <div class="content-subsection all-faults" v-if="currentSubsection === 'all-faults'">
            <h2 class="section-title">
              All faults
            </h2>
            <fault-list :faults="activeFaults" :pending="dtcsPending"></fault-list>
          </div>
          <div class="content-subsection all-faults" v-if="currentSubsection === 'tyres'">
            <h2 class="section-title">
              Tyres
            </h2>
            <tyre-pressure :tyres="tyrePressure" :class="{ active: currentSubsection === 'tyres' }"></tyre-pressure>
            <h3 class="section-title" v-if="activeFaults.length">
              Faults
            </h3>
            <tyre-faults :faults="activeTyreFaults" :pending="dtcsPending" v-show="activeFaults.length"></tyre-faults>
          </div>
        </div>
        <div class="content-section trip-history" :class="{ active: currentSection === 'trip-history' }">
          <mapbox-map :geojson="activeTrip"></mapbox-map>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
//import BatteryLevel from '@/components/visual/BatteryLevel'
//import ConnectionStatus from '@/components/visual/ConnectionStatus'
import MapboxMap from '@/components/visual/MapboxGLMap'
import MenuItem from '@/components/MenuItem'
//import TyrePressure from '@/components/visual/TyrePressure'
//import FaultList from '@/components/visual/FaultList'
//import TyreFaults from '@/components/visual/TyreFaults'
import VehicleService from '@/services/VehicleService'
//import VehicleAPIService from '@/services/VehicleAPIService'
//import DtcService from '@/services/DtcService'

export default {
  name: 'vehicleOverview',
  components: {
    //BatteryLevel,
    //ConnectionStatus,
    MapboxMap,
    MenuItem
    //TyrePressure,
    //FaultList,
    //TyreFaults
  },
  props: ['fields', 'owner', 'vehicle'],
  computed: {
    activeFaults () {
      if (this.currentSection !== 'vehicle-health') {
        return null
      }

      const vehicleHealthSection = this.sections.filter(section => section.code === 'vehicle-health')[0]
      return vehicleHealthSection.items.filter(item => item.code === 'all-faults')[0].data.alerts
    },

    activeTyreFaults () {
      if (this.currentSection !== 'vehicle-health') {
        return null
      }

      const vehicleHealthSection = this.sections.filter(section => section.code === 'vehicle-health')[0]
      return vehicleHealthSection.items.filter(item => item.code === 'all-faults')[0].data.alerts.filter(item => item.master.ui_categorisation === 'tyres')
    },

    activeTrip () {
      if (this.currentSection !== 'trip-history') {
        return null
      }

      const section = this.sections.filter(item => item.code === 'trip-history')[0]

      // GOSH, this line is amazingly ununderstandable.
      // XXX As the trips are grouped by day, for finding the active trip we need to do 45 loopings.
      // A better design - from scratch - of the system, menus and component interactions would help reduce this needs
      const activeTrip = section.items.map(item => item.items.filter(item => item.$active)[0]).filter(item => !!item)[0]
      return activeTrip && activeTrip.data ? activeTrip.data.geojson : null
    },
    availableSubsections () {
      const section = this.sections.filter(item => item.code === this.currentSection)[0]
      if (!section) {
        // TODO Throw error
        return []
      }
      return section.items || []
    },
    pageTitle () {
      if (this.fields.indexOf('vehicle_code') !== -1) {
        return `Vehicle #${this.vehicle.vehicleId}`
      } else if (this.fields.indexOf('vehicle_owner') !== -1) {
        return this.ownerName
      }
    },

    sectionTitle () {
      const section = this.sections.filter(item => item.code === this.currentSection)[0]
      if (section) {
        return section.name
      } else {
        return ''
      }
    }
  },
  created () {
    this.vehicleService = VehicleService.getInstance()
    this.dtcService = DtcService.getInstance()

    const vehicleDevice = this.vehicleService.connect()
    const thingName = this.thingName = this.$route.params.subsection

    const shadowTopic = `$aws/things/${thingName}/shadow/update/accepted`
    const dtcTopic = `connectedcar/dtc/${thingName}`
    const dtcStatusTopic = `connectedcar/cmdsta/${thingName}`
    vehicleDevice.on('connect', () => {
      if (!this.connectedToIot) {
        vehicleDevice.subscribe(shadowTopic)
        vehicleDevice.subscribe(dtcTopic)
        vehicleDevice.subscribe(dtcStatusTopic)
        this.connectedToIot = true
        console.log('created(): Connected to MQTT')
      }
    })

    vehicleDevice.on('error', () => {
      console.error('ERROR: Failed to connect to MQTT')
    })

    //get realtime changes from published shadow updates
    vehicleDevice.on('message', (topic, payload) => {
      console.log('created(): Status change received: ' + payload)
      const newState = JSON.parse(payload)

      switch (topic) {
        case shadowTopic:
          // Battery level update
          if (newState.state && newState.state.reported && newState.state.reported.battery_hv_level) {
            this.batteryLevel = newState.state.reported.battery_hv_level
          }

          // Tyre pressure update
          if (newState.state && newState.state.reported && newState.state.reported.tyre_pressures) {
            this.tyrePressure = { ...this.tyrePressure }
            for (let wheelName in newState.state.reported.tyre_pressures) {
              this.tyrePressure[wheelName] = newState.state.reported.tyre_pressures[wheelName]
            }
            this.$forceUpdate()
          }

          // Location update
          if (newState.state && newState.state.reported && newState.state.reported.location) {
            this.vehicleLocation = newState.state.reported.location
          }

          // Connectivity status update
          if (newState.state && newState.state.reported && newState.state.reported.connected) {
            this.status = newState.state.reported.connected
            this.statusLastUpdated = newState.metadata.reported.connected.timestamp
          }
          break;
        case dtcTopic:
          this.fetchFaults()
          break
        case dtcStatusTopic:
          this.manageDtcs(newState)
      }
    })

    //set initial values from shadow
    this.vehicleService.getState(this.thingName)
      .then(data => {
        this.batteryLevel = data.state.reported.battery_hv_level
        this.tyrePressure = data.state.reported.tyre_pressures
        if (data.state && data.state.reported && data.state.reported.connected) {
          this.status = data.state.reported.connected
          this.statusLastUpdated = data.metadata.reported.connected.timestamp
        }
        this.vehicleLocation = data.state.reported.location
      })

    // Fetch anomalies
    this.fetchFaults()
  },
  data () {
    return {
      //default values on pageload, before real data has loaded in async
      connectedToIot: false,
      ownerName: '',
      batteryLevel: -1,
      status: 'connecting',
      statusLastUpdated: 0,
      dtcsPending: [],
      tyrePressure: {
        FL: [0, 0, 'G'],
        FR: [0, 0, 'G'],
        RL: [0, 0, 'G'],
        RR: [0, 0, 'G']
      },
      vehicleLocation: [0, 0],
      currentSection: 'overview',
      currentSubsection: null,
      sections: [
        {
          code: 'overview',
          name: 'Overview',
          main: true,
          type: 'click'
        },
        {
          code: 'vehicle-health',
          name: 'Vehicle health',
          data: {
            alerts: []
          },
          items: [
            {
              code: 'all-faults',
              name: 'All faults',
              data: {
                alerts: []
              }
            },
            {
              code: 'tyres',
              name: 'Tyres',
              principal: true,
              data: {
                menuMessage: ''
              }
            },
            {
              code: 'washer-fluid',
              name: 'Washer fluid'
            }
          ]
        },
        {
          code: 'trip-history',
          name: 'Trip history',
          type: 'click',
          items: []
        }
      ]
    }
  },
  filters: {
  },
  methods: {
    fetchFaults () {
      this.dtcService.getDtcCodes(this.thingName)
        .then(data => {
          const vehicleHealthSection = this.sections.filter(section => section.code === 'vehicle-health')[0]
          vehicleHealthSection.data.alerts = data

          vehicleHealthSection.items.filter(item => item.code === 'all-faults')[0].data.alerts = data

          const tyreFaults = data.filter(item => item.master.ui_categorisation === 'tyres')
          vehicleHealthSection.items.filter(item => item.code === 'tyres')[0].data.menuMessage = tyreFaults.length !== 0 ? `${tyreFaults.length} faults` : ''
        })
        .catch(err => {
          console.error(err)
        })
    },
    getData () {
      this.vehicleApiService = VehicleAPIService.getInstance()
      const vin = this.thingName

      this.vehicleApiService.getTrips(vin)
        .then(data => {
          const section = this.sections.filter(item => item.code === 'trip-history')[0]

          // Group by day
          const days = []
          const allItems = data.map(item => {
            const day = moment(item.start_time).format('YYYY-MM-DD 00:00:00')
            if (days.indexOf(day) === -1) {
              days.push(day)
            }

            return {
              $active: false,
              code: `trip::${item.trip_id}`,
              name: `${item.start_location_label} to ${item.end_location_label}`,
              overview: `${item.trip_distance} miles | ${moment.duration(item.end_time - item.start_time).humanize()}`,
              data: {
                item,
                geojson: null
              },
              items: [
                {
                  type: 'binomial-timeline',
                  from: moment(item.start_time).format('DD.MM.YYYY - HH:mm'),
                  to: moment(item.end_time).format('DD.MM.YYYY - HH:mm')
                },
                {
                  type: 'tuple',
                  label: 'Average speed',
                  value: item.vehicle_speed_mean,
                  unit: 'mph'
                }
              ],
              principal: true,
              type: 'collapsible'
            }
          })

          const sectionItems = days.sort((a, b) => new Date(b).getTime() - new Date(a).getTime()).map(date => ({
            type: 'group',
            code: moment(date).format('DD.MM.YYYY'),
            name: moment(date).format('DD.MM.YYYY'),
            items: allItems.filter(item => moment(item.data.item.start_time).format('YYYY-MM-DD 00:00:00') === date)
          }))

          section.items = sectionItems
        })
        .catch(err => {
          console.error('ERROR: Failed to fetch trips from vehicle service API')
          console.error(err)
        })
    },

    manageDtcs (state) {
      if (this.dtcsPending.length) {
        const dtc = this.dtcsPending.filter(item => item.exe_id === state.exe_id)[0]
        if (dtc) {
          dtc.$acknowledging = false
          dtc.acknowledged = true
          this.$forceUpdate()
          this.dtcsPending.splice(this.dtcsPending.indexOf(dtc), 1)
        }

        setTimeout(() => {
          this.fetchFaults()
        }, 500)
      }
    },

    setSection (rawSection) {
      const sectionCode = typeof rawSection === 'string' ? rawSection : rawSection.code
      if (sectionCode.indexOf('trip::') === 0) {
        this.selectTrip(rawSection)
      } else {
        const mainSection = this.sections.filter(item => item.code === sectionCode)[0]
        if (mainSection) {
          this.sections.forEach(item => {
            item.$active = false
          })
          this.currentSection = sectionCode
          this.currentSubsection = null
          if (mainSection.items) {
            const mainItem = mainSection.items.filter(item => item.principal)[0]
            if (mainItem) {
              this.currentSubsection = mainItem.code
            } else {
              this.currentSubsection = mainSection.items[0]
            }
          }
        } else {
          const currentSection = this.sections.filter(item => item.code === this.currentSection)[0]
          if (currentSection.items) {
            currentSection.items.forEach(item => {
              item.$active = false
            })
            const subsection = currentSection.items.filter(item => item.code === sectionCode)[0]
            if (subsection) {
              this.currentSubsection = sectionCode
            }
          }
        }

        if (typeof rawSection !== 'string') {
          rawSection.$active = true
        }
      }

      this.$forceUpdate()
    },
    selectTrip (trip) {
      // Deactivate active trips
      const section = this.sections.filter(item => item.code === 'trip-history')[0]
      const activeTrips = section.items.map(item => item.items.filter(item => item.$active)[0]).filter(item => !!item)
      for (let i = 0; i < activeTrips.length; i++) {
        activeTrips[i].$active = false
      }

      const tripId = trip.data.item.trip_id
      const vin = trip.data.item.vin
      this.vehicleApiService.getTrip(tripId, vin)
        .then(data => {
          trip.data.geojson = {}

          trip.data.geojson.route = {
            "id": `${trip.data.item.trip_id}-route`,
            "type": "line",
            "source": {
              "type": "geojson",
              "data": {
                "type": "FeatureCollection",
                "features": [
                  {
                    "type": "Feature",
                    "properties": {},
                    "geometry": {
                      "type": "LineString",
                      "coordinates": data.route.map(item => [item[1], item[0]])
                    }
                  }
                ]
              }
            },
            "layout": {
              "line-join": "round",
              "line-cap": "round",
            },
            "paint": {
              "line-color": "#5cb8e6",
              "line-width": 8,
              "line-opacity": 0.5
            }
          }

          trip.data.geojson.labels = {
            "id": `${trip.data.item.trip_id}-labels`,
            "type": "circle",
            "source": {
              "type": "geojson",
              "data": {
                "type": "FeatureCollection",
                "features": [
                  {
                    type: 'Feature',
                    properties: {
                      title: 'Start',
                      color: 'red'
                    },
                    geometry: {
                      type: 'Point',
                      coordinates: [data.route[0][1], data.route[0][0]]
                    }
                  },
                  {
                    type: 'Feature',
                    properties: {
                      title: 'End',
                      color: 'green'
                    },
                    geometry: {
                      type: 'Point',
                      coordinates: [data.route[data.route.length-1][1], data.route[data.route.length-1][0]]
                    }
                  }
                ]
              }
            },
            "layout": {

            },
            "paint": {
              "circle-radius": 8,
              'circle-stroke-width': 2,
              'circle-stroke-color': '#fff',
              'circle-color': [
                'match',
                ['get', 'color'],
                'red', '#e62e4d',
                'green', '#52cc95',
                '#000'
              ]
            }
          }
        })
        .catch(err => {
          console.error('ERROR: Failed to get trip')
          console.error(err)
        })
    },
    setOwnerName () {
      const vehicle = this.vehicle
      if (!vehicle) return ''
      const owner = this.owner
      if (!owner) return ''

      const attrs = owner.Attributes
      if (!attrs) return ''

      const firstName = attrs.filter(i => i.Name === 'given_name')[0].Value
      const lastName = attrs.filter(i => i.Name === 'family_name')[0].Value
      this.ownerName = `${firstName} ${lastName}`
    }
  },
  mounted () {
    this.getData()
    this.setOwnerName()
  },
  watch: {
    owner (val) {
      this.setOwnerName()
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
@import '../../assets/colors.scss';
@import '../../assets/sizes.scss';

.section.vehicle-overview {
  .vehicle-info {
    overflow: hidden;
    max-height: 10000px;

    &:not(.active) {
      max-height: 0px;
    }

    .padded {
      padding-left: 1em;
    }
  }
}

</style>
