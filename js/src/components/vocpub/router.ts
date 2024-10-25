import { createWebHistory, createRouter } from 'vue-router'

import HomeView from '@/components/vocpub/views/HomeView.vue'
import ResourceView from '@/components/vocpub/views/ResourceView.vue'
import OpenedHomeView from '@/components/vocpub/views/OpenedHomeView.vue'
import NewProjectView from '@/components/vocpub/views/NewProjectView.vue'

const routes = [
  { path: '/', component: HomeView },
  { path: '/edit', component: OpenedHomeView },
  { path: '/edit/resource', component: ResourceView, name: 'resource' },
  { path: '/new-project', component: NewProjectView }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
