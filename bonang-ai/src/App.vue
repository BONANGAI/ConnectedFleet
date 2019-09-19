<template>
  <div id="app" v-show="status === 'run'">
    <top-menu></top-menu>
    <router-view v-on:state="statusChange" />
  </div>
</template>

<script>
import 'bootstrap'
import 'bootstrap/scss/bootstrap.scss'
import TopMenu from '@/components/TopMenu'
import AuthService from '@/services/AuthService'

export default {
  name: 'App',
  components: {
    TopMenu
  },
  created () {
    const auth = this.auth = AuthService.getInstance()
    if (this.$route.name !== 'Login') {
      const creds = auth.getCredentials()
      if (creds) {
        this.statusChange('run')
      }
    }
  },
  data () {
    return {
      status: 'load',
      user: '',
      group: '',
      entity: ''
    }
  },
  methods: {
    statusChange (st) {
      this.status = st
    }
  },
  mounted () {

  }
}
</script>

<style lang="scss">
@import 'assets/colors.scss';
@import 'assets/sizes.scss';
body {
  position: absolute;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;

  #app {
    position: relative;
    width: 100%;
    height: 100%;
    font-family: Helvetica;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: $font-color;

    .menu {

      .menu-item {
        font-size: 0.9em;

        .active a {
          color: $font-color;
        }

        &:not(.active) a {
          color: $top-menu-unselected-item-color;

          &:hover {
            color: $top-menu-unselected-item-hover-color;
          }
        }
      }
    }

    .view {
      position: relative;
      margin: 0;

      &.cover {
        position: absolute;
        top: $menu-height;
        left: 0px;
        width: 100%;
        bottom: 0px;
        overflow: auto;
      }

      .badge:not(.badge-plain) {
        position: relative;
        text-align: left;
        color: $font-color;
        font-weight: 400;

        &.badge-block {
          display: block;
          width: 100%;
          margin-top: 1em;
        }

        &.badge-padded {
          padding: 1em 1.5em;
          padding-left: 40px;
        }

        &.badge-primary {
          background: $badge-primary-background;

          &::before {
            position: absolute;
            top: 8px;
            left: 10px;
            content: '';
            background: url('assets/tick_icon.svg') center center no-repeat;
            width: 20px;
            height: 20px;
          }
        }

        &.badge-warning {
          background: $badge-warning-background;

          @keyframes icon-spin {
            100% {
              transform: rotate(360deg);
            }
          }

          &::before {
            position: absolute;
            top: 8px;
            left: 10px;
            content: '';
            background: url('assets/waiting_icon_provisional.png') center center no-repeat;
            background-size: 100% 100%;
            animation: icon-spin 1s linear infinite;
            width: 20px;
            height: 20px;
          }
        }

        &.badge-success {
          background: $badge-success-background;

          &::before {
            position: absolute;
            top: 8px;
            left: 10px;
            content: '';
            background: url('assets/tick_icon.svg') center center no-repeat;
            width: 20px;
            height: 20px;
          }
        }

        &.badge-danger {
          background: $badge-danger-background;

          &::before {
            position: absolute;
            top: 8px;
            left: 10px;
            content: '';
            background: url('assets/warning_icon.svg') center center no-repeat;
            width: 20px;
            height: 20px;
          }
        }
      }

      .section {
        width: 100%;
        height: 100%;
      }

      .panel {
        width: auto;
        margin: auto;
        margin-top: $panel-margin-top;

        .subpanel {
          position: absolute;
          top: 0px;
          left: 0px;
          min-height: 100%;
          right: 100% - $subpanel-width;
          padding-top: 2em;
          overflow: hidden;
          white-space: nowrap;

          > * {
            padding: 0 20px;
          }

          &:not(.sub) {
            transition: right 0.25s ease-in-out;
            &.slided {
              right: 100%;
              transition: right 0.4s ease-in-out;
            }
          }

          &.sub {
            position: absolute;
            top: 0px;
            left: $subpanel-width;
            transition: left 0.25s ease-in-out;

            &.slided {
              transition: left 0.4s ease-in-out;
              left: 0px;
            }
          }
        }

        &.full {
          margin: 0px;
          padding: 0px;
          width: 100%;
          height: 100%;
        }

        &.central {
          position: relative;
          max-width: $panel-max-width;
          
          &.lg {
            max-width: $panel-lg-max-width;
          }
        }

        h1.title {
          font-size: $panel-title-h1-font-size;
          margin-bottom: $panel-title-h1-margin-bottom;
        }

        h2.title, h2.section-title {
          margin: 2em 30px !important;
        }

        h3.title, h3.section-title {
          margin: 1em 30px 2em 30px !important;
          font-size: 28px;
          font-weight: bold;
        }

        .title-actions {
          float: right;
        }

        .back {
          position: relative;
          margin-bottom: 1em;
          font-size: 1.1em;
          cursor: pointer;

          &::before {
            float: left;
            content: ' ';
            width: 20px;
            height: 20px;
            margin-top: 2px;
            margin-right: 5px;
            background: url('assets/back_arrow.svg') center center no-repeat;
          }
        }

        .menu {
          margin-top: 2em;
          padding: 0;

          .menu-item {

            > .menu-item-badges, > .menu-item-message {
              position: absolute;
              top: 50%;
              margin-top: -0.8em;
              right: 4em;
            }

            > .menu-item-badges {
              .badge {
                padding: 0.5em 0.75em;
                font-size: 0.9em;
                font-weight: 200;
              }
            }

            &.menu-group {
              font-size: 1.1em;

              > .menu-item-title {
                padding-left: 20px;
                color: $font-muted-color;
              }


              .menu-item {
                &:last-child {
                  margin-bottom: 1em;
                }
              }
            }

            &:not(.menu-group) {
              position: relative;
              padding: 2em 20px;
              border: 1px solid $panel-menu-border-color;
              border-left: none;
              border-right: none;
              font-size: 1.1em;
              cursor: pointer;

              &:not(:first-child) {
                margin-top: -1px;
              }

              .menu-item-overview {
                display: block;
                font-size: 0.8em;
                margin-top: 0.9em;
              }

              &:not(.active) {
                .menu-item-title {
                  display: block;
                }
              }

              .menu-item-title {
                max-width: 90%;
                overflow: hidden;
                text-overflow: ellipsis;
              }

              &:hover, &.selected {
                background: $panel-menu-selected-background;
              }

              &::after {
                position: absolute;
                top: 50%;
                right: 2em;
                width: 20px;
                height: 20px;
                margin-top: -10px;
                background: url('assets/right_arrow.svg') center center no-repeat;
                transition: transform 0.3s ease-in-out;
                content: ' ';
              }
            }

            &.menu-collapsible {
              transition: all 0.5s ease-in-out;
              padding: 1em;

              &.selected {
                background: transparent !important;

                &::after {
                  position: absolute;
                  top: 50%;
                  right: 2em;
                  width: 20px;
                  height: 20px;
                  margin-top: -10px;
                  background: url('assets/right_arrow.svg') center center no-repeat;
                  transform: rotate(90deg);
                  content: ' ';
                }

                .menu-subitems {
                  height: auto;
                }
              }

              &:not(.selected) {
                .menu-subitems {
                  height: 0px;
                }
              }

              .menu-subitems {
                overflow: hidden;

                .menu-subitem {
                  margin: 1em 0;

                  &:last-child {
                    margin-bottom: 0;
                  }

                  .subitem-content {
                    font-size: 0.9em;

                    &.bt-label-item, .bt-label-item {
                      display: block;

                      &::before {
                        content: attr(data-label) ': ';
                        color: $mid-grey;
                      }
                    }

                    &.binomial-timeline {
                      position: relative;
                      
                      &::before {
                        position: relative;
                        content: ' ';
                        display: block;
                        width: 15px;
                        height: 45px;
                        background: url('assets/binomial-timeline-icon.png') 0px center no-repeat;
                        background-size: auto 80%;
                        float: left;
                      }
                    }
                  }
                }
              }

              
            }
          }

          &.menu-subitems {
            margin: 0.5em 0 2em 0;
          }
        }

        .panel-content {
          position: absolute;
          top: 0px;
          left: $subpanel-width;
          right: 0px;
          min-height: 100%;
          padding-bottom: 2em;
          border-left: 1px solid $panel-border-color;

          .content-section {
            top: 0px;
            left: 0px;
            width: 100%;
            opacity: 1;

            &.margined {
              margin: 2em 1em;
            }

            &:not(.scroll) {
              position: absolute;
              bottom: 0px;
            }

            &.scroll {
              position: relative;
            }

            &:not(.active) {
              opacity: 0;
              transition: opacity 0.25s ease-in-out;
              z-index: 1;
            }

            &.active {
              transition: opacity 0.4s ease-in-out;
              z-index: 2;
            }

            .section-title {
              margin: 2em;

              &h3 {
                font-weight: bold;
              }
            }

            &.vehicle-health {

            }
          }
        }
      }

      .form {
        .form-item {
          margin: 1em 0;

          &.form-multi-col {
            .form-item {
              display: block;
              float: left;
              margin: 0 1em;

              &:first-child {
                margin-left: 0;
              }

              &:last-child {
                margin-right: 0;
              }
            }

            &::after {
              content: '';
              display: block;
              clear: both;
            }
          }

          &.form-autocomplete {
            position: relative;
            margin: 1em 0;

            > * {
              position: absolute;
              top: 0px;
              left: 0px;
              width: 100%;
            }
          }

          .form-label {
            font-weight: bold;
            color: $form-item-label-color;
            font-size: 0.8em;
          }

          .form-input {
            color: $form-item-input-color;

            &.spaced {
              letter-spacing: 3px;
            }

            &[type="text"] {
              padding: 0.5em 1em;
              font-size: 1.3em;
            }

            &.label {
              display: block;
              font-size: 1.3em;
            }
          }
        }

        .form-actions {
          text-align: center;
        }
      }

      .well {
        color: $well-color;
        background: $well-background;
        padding: 0.5em 1em;
        border-radius: 3px;
      }

      .list {
        position: relative;

        .list-header, .list-item {
          padding: 0;
          margin: 0;

          .col {
            display: inline-block;
            vertical-align: middle;
            margin: 0;
            padding: 0;

            &:not(:first-child) {
              margin-left: -1px;
            }

            &.col-sixth {
              width: 16%;
            }
            
            &.col-quarter {
              width: 24%;
            }
            
            &.col-third {
              width: 33%;
            }

            &.col-half {
              width: 49%;
            }
          }
        }

        .list-header {
          padding-bottom: 0.5em;
          border-bottom: 1px solid $list-item-border-color;
          > .col {
            font-weight: bold;
          }
        }
        
        .list-item {
          padding: 0.5em 1em;
          background: $list-item-background;

          &.no-hz-padding {
            padding-left: 0px !important;
            padding-right: 0px !important;
          }

          &.lg {
            padding: 2em 1em;
          }

          &:not(.item-no-hover):hover {
            background: $list-item-hover-background;
          }

          &.transparent {
            background: transparent;

            &:not(.item-no-hover):hover {
              background: $list-item-background;
            }
          }

          &.pointer {
            cursor: pointer;
          }

          &:first-child {
            border-top-left-radius: 3px;
            border-top-right-radius: 3px;
          }

          &:last-child {
            border-bottom-left-radius: 3px;
            border-bottom-right-radius: 3px;
          }

          &:not(:first-child) {
            margin-top: -1px;
            border-top: 1px solid $list-item-border-color;
          }

          .item-code {
            float: left;
            margin-right: $list-item-code-margin-right;
          }
        }
      }
    }
  }
}

.text-muted {
  color: $font-muted-color;
}

button.btn {
  width: auto;
  margin: auto;

  &.btn-block {
    margin-top: 1em;
  }

  &:not(.btn-link) {
    padding: 0.5em 1.5em;
  }

  &.btn-link {
    font-size: 0.8em;
  }

  &.btn-default {
    background: $form-actions-button-default-background;
    color: $form-actions-button-default-color;
    border: none;
    outline: none;

    &:hover {
      background: $form-actions-button-default-hover-background;
    }
  }

  &.btn-success {
    background: $form-actions-button-success-background;
    color: $form-actions-button-success-color;
    border: none;
    outline: none;

    &:hover {
      background: $form-actions-button-success-hover-background;
    }
  }

  &.btn-primary {
    background: $form-actions-button-primary-background;
    color: $form-actions-button-primary-color;
    border: none;
    outline: none;

    &:hover {
      background: $form-actions-button-primary-hover-background;
    }
  }

  &.btn-link {
    background: transparent;
    color: $form-actions-button-link-color;

    &:hover {
      color: $form-actions-button-link-hover-color;
    }
  }
}

.text-cap {
  text-transform: capitalize;
}

// Hide mapbox stuff
.mapboxgl-ctrl-bottom-left, .mapboxgl-ctrl-bottom-right {
  display: none !important;
}
</style>
