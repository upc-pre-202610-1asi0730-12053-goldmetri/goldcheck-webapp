export default [
  { path: 'analytics/dashboard', name: 'analytics-dashboard', component: () => import('./views/dashboard/dashboard.vue') },
  { path: 'analytics/shrinkage', name: 'analytics-shrinkage', component: () => import('./views/shrinkage/shrinkage.vue') },
  { path: 'analytics/validated-volume', name: 'analytics-validated-volume', component: () => import('./views/validated-volume/validated-volume.vue') }
]
