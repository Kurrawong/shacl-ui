import { createWebHistory, createRouter } from 'vue-router'

import HomeView from '@/components/vocpub/views/HomeView.vue'
import ResourceView from '@/components/vocpub/views/ResourceView.vue'
import OpenedHomeView from '@/components/vocpub/views/OpenedHomeView.vue'

const routes = [
  { path: '/', component: HomeView },
  { path: '/edit', component: OpenedHomeView },
  { path: '/edit/resource', component: ResourceView, name: 'resource' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
