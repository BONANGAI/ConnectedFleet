<template>
  <div class="vehicle-status">
    <div class="battery-level container low">
      <i class="icon-container">
        <i class="icon-content" :class="{ full: vehicle.battery_hv_level > 0.96, high: vehicle.battery_hv_level > 0.2, mid: vehicle.battery_hv_level > 0.11 && vehicle.battery_hv_level <= 0.2, low: vehicle.battery_hv_level <= 0.11  }" :style="{ width: batteryWidth + 'px' }">&nbsp;</i>
      </i>
      <span class="label">{{ Math.floor( vehicle.battery_hv_level * 100 ) }}%</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'vehicleStatus',
  props: ['vehicle'],
  computed: {
    batteryWidth () {
      return (49 * this.vehicle.battery_hv_level)
    }
  },
  data () {
    return {
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.vehicle-status {
    height: 100%;
    display: block;

    .container {
      position: relative;
      margin: auto;
      max-width: 160px;

      &.battery-level {
        margin-top: 5em;
        font-size: 1.5em;
        font-weight: 200;

        .icon-container {
          position: relative;
          display: inline-block;
          background: url('../assets/battery_outline.svg') center center no-repeat;
          margin-top: 0.2em;
          width: 63px;
          height: 30px;
          background-size: 100% 100%;

          .icon-content {
            position: absolute;
            top: 4px;
            left: 5px;
            width: 49px;
            bottom: 4px;
            background: red;
            border-top-left-radius: 2px;
            border-bottom-left-radius: 2px;

            &.full {
              border-top-right-radius: 2px;
              border-bottom-right-radius: 2px;
            }

            &.low {
              background: red;
            }

            &.mid {
              background: orange;
            }

            &.high {
              background: green;
            }
          }
        }

        .label {
          position: relative;
          float: right;
          margin-top: 2px;
        }
      }

      h2.title {
        font-size: 1em;
        margin: 0;
      }

      .inline {
        position: absolute;
        right: 10pt;
        top: 10pt;
      }
    }
}

</style>
