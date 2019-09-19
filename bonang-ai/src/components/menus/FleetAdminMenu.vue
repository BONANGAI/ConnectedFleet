<template>
  <div class="collapse navbar-collapse menu fleet-admin" id="mainMenu">
    <ul class="navbar-nav mr-auto">
      <li class="nav-item menu-item" v-for="item in menuItems" :class="{ active: item.path === $route.params.section }">
        <router-link class="nav-link" :to="`/fleet-admins/${item.path}`">
          {{ item.name }}
        </router-link>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'fleetAdminMenu',
  data () {
    return {
      menuItems: [
        {
          path: 'all-vehicles',
          name: 'All vehicles'
        }
      ]
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.menu.fleet-admin {
  width: 100%;
  height: 100%;
  display: block;
}

</style>
