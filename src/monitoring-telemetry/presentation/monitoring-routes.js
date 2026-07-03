export default [
  { path: 'monitoring/dashboard',   name: 'monitoring-dashboard',   component: () => import('./views/dashboard/dashboard.vue') },
  { path: 'monitoring/checkpoints', name: 'monitoring-checkpoints', component: () => import('./views/checkpoints/checkpoints.vue') },
  { path: 'monitoring/route-alerts', name: 'monitoring-route-alerts', component: () => import('./views/route-alerts/route-alerts.vue') }
]
