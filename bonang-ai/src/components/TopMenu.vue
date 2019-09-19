<template>
  <nav class="menu top-menu navbar navbar-expand-lg navbar-light bg-light">
    <a class="navbar-brand" href="#">
      {{ auth.group | groupName }}
    </a>

    <fleet-admin-menu v-if="auth.group === 'fleet-admins'"></fleet-admin-menu>
    <user-menu :user="auth.userToken"></user-menu>
  </nav>
</template>

<script>
import AuthService from '@/services/AuthService'
import FleetAdminMenu from '@/components/menus/FleetAdminMenu'
import UserMenu from '@/components/menus/UserMenu'


export default {
  name: 'topMenu',
  components: {
    FleetAdminMenu,
    UserMenu

  },
  created () {
    this.auth = AuthService.getInstance()
  },
  data () {
    return {
      auth: null
    }
  },
  filters: {
    groupName (value) {
      switch (value) {
        case 'fleet-admins':
          return 'Fleet Administrator'
      }
    }
  },
  watch: {
    'auth.group' (value) {
      this.$forceUpdate()
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
@import '../assets/colors.scss';
.top-menu {
  background: $top-menu-background;

  .logo {
    height: 20pt;
  }
}

</style>
