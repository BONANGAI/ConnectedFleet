<template>
  <div class="mapbox-map">
    <div class="map" :id="mapId"></div>
  </div>
</template>

<script>
import mapbox from 'mapbox-gl'
import randomstring from 'randomstring'
import ConfigurationService from '@/services/ConfigurationService'

export default {
  name: 'mapboxMap',
  created () {
    this.config = ConfigurationService.getInstance()
    mapbox.accessToken = this.config.get('MAPBOX_API_TOKEN')
  },
  props: ['locations', 'selected-index', 'selected-label', 'hover-index', 'click-index', 'initialZoom', 'initialBoundsOffset', 'geojson'],
  data () {
    return {
      zoom: this.initialZoom || 5,
      boundsOffset: this.initialBoundsOffset || 0.01,
      mapId: `mapbox-${randomstring.generate(8)}`,
      map: null,
      vehicleMarker: null,
      lngLatLocation: [-2.104542032141353, 51.59578468690937],
      markers: {},
      selectedMarker: null,
      layers: {}
    }
  },
  mounted () {
    this.map = new mapbox.Map({
      zoom: this.zoom,
      container: this.mapId,
      center: this.lngLatLocation,
      style: 'mapbox://styles/mapbox/light-v9'
    })

    this.map.on('load', () => {
      this.renderMapLayers()
    })
  },
  methods: {
    calculateDistance (lat1, lon1, lat2, lon2) {
      var R = 6371 // Earth's radius in Km
      return Math.acos(Math.sin(lat1) * Math.sin(lat2) +
        Math.cos(lat1) * Math.cos(lat2) *
        Math.cos(lon2 - lon1)) * R
    },

    parseLocation (location) {
      return new mapbox.LngLat(location[1], location[0])
    },
    renderMapLayers (config = {}) {
      // Remove markers
      if (this.locations) {
          for (let m = 0; m < this.markers.length; m++) {
          this.markers[m].map.remove()
        }
        this.markers = []

        if (this.selectedMarker) {
          this.selectedMarker.remove()
          this.selectedMarker = null
        }

        for (let i = 0; i < this.locations.length; i++) {
          const location = this.parseLocation(this.locations[i])

          const marker = {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: location
            },
            properties: {
              icon: 'vehicle'
            }
          }

          const markerElement = document.createElement('div')
          markerElement.className = 'marker vehicle-marker'
          markerElement.style.backgroundSize = '100% auto'
          markerElement.style.backgroundImage = 'url(/static/marker_inactive.svg)'
          markerElement.style.width = '40px'
          markerElement.style.height = '47px'
          markerElement.style.cursor = 'pointer'
          const currentIndex = i
          markerElement.addEventListener('mouseover', e => {
            this.hoverIndex(currentIndex)
          })
          markerElement.addEventListener('mouseout', e => {
            if (this.selectedIndex === currentIndex) {
              this.hoverIndex(null)
            }
          })
          markerElement.addEventListener('click', e => {
            this.clickIndex(currentIndex)
          })

          // If marker is selected, append popup
          const index = config.index || this.selectedIndex
          if (index === i) {
            this.selectedMarker = new mapbox.Popup({
              closeButton: false,
              closeOnClick: false,
              offset: 25
            })
              .setText(this.selectedLabel)
              .setLngLat(location)
              .addTo(this.map)
            markerElement.style.backgroundImage = 'url(/static/marker_active.svg)'
          } else {
            markerElement.style.backgroundImage = 'url(/static/marker_inactive.svg)'
          }

          const mapMarker = new mapbox.Marker(markerElement)
            .setLngLat(location)
            .addTo(this.map)

          // marker.addTo(this.map)
          this.markers.push({
            map: mapMarker,
            data: marker
          })
        }

        // Get fit bounds
        const lats = this.locations.map(item => item[0])
        const lons = this.locations.map(item => item[1])
        const minLat = Math.min.apply(this, lats) - this.boundsOffset
        const minLon = Math.min.apply(this, lons) - this.boundsOffset
        const maxLat = Math.max.apply(this, lats) + this.boundsOffset
        const maxLon = Math.max.apply(this, lons) + this.boundsOffset

        this.map.fitBounds([[minLon, minLat], [maxLon, maxLat]])
      }
    },
    renderSelectedMarker (item) {
      if (this.selectedMarker) {
        this.selectedMarker.remove()
        this.selectedMarker = null
      }

      this.selectedMarker = new mapbox.Popup({ closeButton: false })
        .setLngLat(item)
        .setHTML(this.selectedLabel)
        .addTo(this.map)
    }
  },
  watch: {
    geojson (val, oldval) {
      if (!!val) {
        for (let layerId in this.layers) {
          try {
            this.map.removeLayer(layerId)
            this.map.removeSource(layerId)
          } catch (e) {
            console.error(`ERROR: Layer ${layerId} failed to remove.`)
          }
        }
        this.layers = {}
        this.layers[val.route.id] = {}
        this.layers[val.labels.id] = {}
        this.map.addLayer(val.route)
        this.map.addLayer(val.labels)
        const coordinates = val.route.source.data.features[0].geometry.coordinates
        const lats = coordinates.map(item => item[1])
        const lons = coordinates.map(item => item[0])
        const minLat = Math.min.apply(this, lats) - this.boundsOffset
        const minLon = Math.min.apply(this, lons) - this.boundsOffset
        const maxLat = Math.max.apply(this, lats) + this.boundsOffset
        const maxLon = Math.max.apply(this, lons) + this.boundsOffset

        this.map.fitBounds([[minLon, minLat], [maxLon, maxLat]])
        this.$forceUpdate()
      }
    },
    locations (val) {
      this.renderMapLayers()
    },
    selectedIndex (val) {
      setTimeout(() => {
        this.renderMapLayers({ index: val })
      })
    },
    selectedLabel (value) {

    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
@import '../../assets/sizes.scss';

.mapbox-map {
  position: relative;
  width: 100%;
  height: 100%;
  display: block;

  .map {
    position: fixed;
    top: $menu-height;
    left: $subpanel-width;
    right: 0px;
    bottom: 0px;
  }
}

</style>
