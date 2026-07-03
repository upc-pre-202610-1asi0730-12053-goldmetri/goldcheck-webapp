export default [
  { path: 'monitoring/dashboard',   name: 'monitoring-dashboard',   component: () => import('./views/dashboard/dashboard.vue') },
  { path: 'monitoring/checkpoints', name: 'monitoring-checkpoints', component: () => import('./views/checkpoints/checkpoints.vue') }
]
