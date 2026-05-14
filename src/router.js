import { createRouter, createWebHistory } from 'vue-router'
import { useIamStore } from './iam/application/iam.store.js'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/auth/login' },

    // IAM
    {
      path: '/auth',
      children: [
        { path: 'login',    name: 'login',    component: () => import('./iam/presentation/views/login/login.vue') },
        { path: 'register', name: 'register', component: () => import('./iam/presentation/views/register/register.vue') }
      ]
    },

    // Protected app shell
    {
      path: '/app',
      component: () => import('./shared/presentation/components/app-layout.vue'),
      meta: { requiresAuth: true },
      children: [
        // Profile
        { path: 'profile', name: 'profile', component: () => import('./iam/presentation/views/profile/profile.vue') },

        // Mineral Extraction (Minería)
        { path: 'mineral/dashboard',   name: 'mineral-dashboard',   component: () => import('./mineral-extraction/presentation/views/dashboard/dashboard.vue') },
        { path: 'mineral/operations',  name: 'mineral-operations',  component: () => import('./mineral-extraction/presentation/views/operations/operations.vue') },
        { path: 'mineral/fleet',       name: 'mineral-fleet',       component: () => import('./mineral-extraction/presentation/views/fleet/fleet.vue') },
        { path: 'mineral/reports',     name: 'mineral-reports',     component: () => import('./mineral-extraction/presentation/views/reports/reports.vue') },

        // Jewelry Inventory (Joyería)
        { path: 'jewelry/dashboard',   name: 'jewelry-dashboard',   component: () => import('./jewelry-inventory/presentation/views/dashboard/dashboard.vue') },
        { path: 'jewelry/inventory',   name: 'jewelry-inventory',   component: () => import('./jewelry-inventory/presentation/views/inventory/inventory.vue') },
        { path: 'jewelry/register',    name: 'jewelry-register',    component: () => import('./jewelry-inventory/presentation/views/register-jewelry/register-jewelry.vue') },
        { path: 'jewelry/certifications', name: 'jewelry-certifications', component: () => import('./jewelry-inventory/presentation/views/certifications/certifications.vue') },
        { path: 'jewelry/reports',     name: 'jewelry-reports',     component: () => import('./jewelry-inventory/presentation/views/reports/reports.vue') },

        // Consumer Experience (Consumidor)
        { path: 'consumer/collection', name: 'consumer-collection', component: () => import('./consumer-experience/presentation/views/my-collection/my-collection.vue') },
        { path: 'consumer/verify',     name: 'consumer-verify',     component: () => import('./consumer-experience/presentation/views/verify/verify.vue') },
        { path: 'consumer/certificates', name: 'consumer-certificates', component: () => import('./consumer-experience/presentation/views/certificates/certificates.vue') },

        // Analytics
        { path: 'analytics/dashboard', name: 'analytics-dashboard', component: () => import('./analytics/presentation/views/dashboard/dashboard.vue') },

        // Refinery
        { path: 'refinery/dashboard',  name: 'refinery-dashboard',  component: () => import('./refinery-processing/presentation/views/dashboard/dashboard.vue') },

        // Custody Chain
        { path: 'custody/dashboard',   name: 'custody-dashboard',   component: () => import('./custody-chain/presentation/views/dashboard/dashboard.vue') },

        // Subscriptions
        { path: 'subscriptions/plans', name: 'subscriptions-plans', component: () => import('./subscriptions/presentation/views/plans/plans.vue') }
      ]
    },

    // Catch-all
    { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('./shared/presentation/views/page-not-found.vue') }
  ]
})

router.beforeEach((to, _from, next) => {
  document.title = to.meta.title ? `${to.meta.title} | GoldCheck` : 'GoldCheck - GoldMetrics'

  if (to.meta.requiresAuth) {
    const iamStore = useIamStore()
    if (!iamStore.isAuthenticated) {
      return next({ name: 'login' })
    }
  }
  next()
})

export default router
