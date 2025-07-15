import Vue from 'vue'
import VueRouter from 'vue-router'
import Create from '../views/Create.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Create
  },
  {
    path: '/explore',
    name: 'Explore',
    component: () => import('../views/Explore.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/signup',
    name: 'Signup',
    component: () => import('../views/Signup.vue')
  },
  {
    path: '/pricing',
    name: 'Pricing',
    component: () => import('../views/Pricing.vue')
  },
  {
    path: '/terms',
    name: 'Terms',
    component: () => import('../views/Terms.vue')
  },
  {
    path: '/privacy',
    name: 'Privacy',
    component: () => import('../views/Privacy.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router 