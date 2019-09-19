import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import Login from '@/components/Login'
import Overview from '@/components/Overview'
import FleetAdminView from '@/components/FleetAdminView'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'HelloWorld',
      component: HelloWorld
    },
    {
      path: '/id_token=:id&access_token=:access&expires_in=:expiration&token_type=:type',
      name: 'Login',
      component: Login
    },
    {
      path: '/owners/overview',
      name: 'Overview',
      component: Overview
    },
    {
      path: '/fleet-admins/:section',
      name: 'FleetAdmins',
      component: FleetAdminView
    },
    {
      path: '/fleet-admins/:section/:subsection',
      name: 'FleetAdmins',
      component: FleetAdminView
    }
  ]
})
