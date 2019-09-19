<template>
  <div class="menu user">
    <span class="user-icon"></span>
    <span class="full-name">{{ fullName }}</span>
    <span class="sign-out">
      <a :href="logoutUrl">Sign out</a>
    </span>
  </div>
</template>

<script>
import AuthService from '@/services/AuthService'

export default {
  name: 'userMenu',
  props: ['user'],
  created () {
    this.auth = AuthService.getInstance()
    this.logoutUrl = this.auth.getLogoutUrl()
  },
  computed: {
    fullName () {
      var fullDisplayName = ''
      if (this.user) {
        fullDisplayName = `${this.user.given_name} ${this.user.family_name}`
      }
      return fullDisplayName
    }
  },
  data () {
    return {
      auth: null,
      logoutUrl: ''
    }
  },
  watch: {
    user (value) {
      this.$forceUpdate()
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.menu.user {
  position: absolute;
  right: 15px;
  top: 18px;
  white-space: nowrap;

  .user-icon {
    float: left;
    // margin-top: -5px;
    margin-right: 10px;
    background: url('../../assets/user_icon.svg') center center no-repeat;
    background-size: 100% 100%;
    width: 25px;
    height: 25px;
  }

  .full-name {
    margin-right: 1em;
    font-size: 0.8em;
  }

  .sign-out {
    font-size: 0.8em;
  }
}

</style>
