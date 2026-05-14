import { createRouter, createWebHistory } from 'vue-router'
import { useIamStore } from './iam/application/iam.store.js'

import fleetRoutes           from './fleet-operations/presentation/fleet-operations-routes.js'
import materialRoutes        from './material-operations/presentation/material-operations-routes.js'
import jewelryRoutes         from './jewelry-inventory-certification/presentation/jewelry-routes.js'
import consumerRoutes        from './consumer-traceability/presentation/consumer-routes.js'
import monitoringRoutes      from './monitoring-telemetry/presentation/monitoring-routes.js'
import analyticsRoutes       from './analytics/presentation/analytics-routes.js'
import incidentRoutes        from './incident-management/presentation/incident-routes.js'
import reportingRoutes       from './reporting-notifications/presentation/reporting-routes.js'
import maintenanceRoutes     from './asset-maintenance/presentation/asset-maintenance-routes.js'
import subscriptionRoutes    from './subscriptions-billing/presentation/subscriptions-routes.js'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/auth/login' },

    // IAM – public auth pages
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
        // IAM – profile
        { path: 'profile', name: 'profile', component: () => import('./iam/presentation/views/profile/profile.vue') },

        // Fleet Operations
        ...fleetRoutes,

        // Material Operations
        ...materialRoutes,

        // Jewelry Inventory & Certification
        ...jewelryRoutes,

        // Consumer Traceability
        ...consumerRoutes,

        // Monitoring & Telemetry
        ...monitoringRoutes,

        // Analytics
        ...analyticsRoutes,

        // Incident Management
        ...incidentRoutes,

        // Reporting & Notifications
        ...reportingRoutes,

        // Asset & Maintenance Management
        ...maintenanceRoutes,

        // Subscriptions & Billing
        ...subscriptionRoutes
      ]
    },

    // Static legal pages
    { path: '/terms',   name: 'terms',   component: () => import('./shared/presentation/views/terms.vue') },
    { path: '/privacy', name: 'privacy', component: () => import('./shared/presentation/views/privacy.vue') },

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
