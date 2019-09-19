<template>
  <div class="login">
    Login
  </div>
</template>

<script>
import AuthService from '@/services/AuthService'
import ConfigurationService from '@/services/ConfigurationService'

export default {
  name: 'login',
  created () {
    this.auth = AuthService.getInstance()
    this.config = ConfigurationService.getInstance()
  },
  data () {
    return {
      token: '',
      routeConfig: {
        'fleet-admins': '/fleet-admins/all-vehicles',
        'service-center': '/service-admins/customer-search',
        'contact-center': '/contact-centre/customer-search',
        'owners': '/owners/overview'
      }
    }
  },
  mounted () {
    this.auth.postAuth(this.$route.params.id)
      .then(() => {
        this.$emit('state', 'run')

        const userGroup = this.auth.group
        const routeToPush = this.routeConfig[userGroup] || '/overview'
        this.$router.push(routeToPush)
      })
      .catch(err => {
        console.error(err)
      })
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.login {
    height: 100%;
    display: block;
}

</style>
