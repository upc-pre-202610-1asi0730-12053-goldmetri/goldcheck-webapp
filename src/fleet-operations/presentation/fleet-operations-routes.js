export default [
  { path: 'fleet/dashboard',  name: 'fleet-dashboard',  component: () => import('./views/dashboard/dashboard.vue') },
  { path: 'fleet/operations', name: 'fleet-operations', component: () => import('./views/operations/operations.vue') },
  { path: 'fleet/vehicles',   name: 'fleet-vehicles',   component: () => import('./views/fleet/fleet.vue') },
  { path: 'fleet/reports',    name: 'fleet-reports',    component: () => import('./views/reports/reports.vue') }
]
