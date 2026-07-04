export default [
  { path: 'jewelry/dashboard',      name: 'jewelry-dashboard',      component: () => import('./views/dashboard/dashboard.vue') },
  { path: 'jewelry/inventory',      name: 'jewelry-inventory',      component: () => import('./views/inventory/inventory.vue') },
  { path: 'jewelry/register',       name: 'jewelry-register',       component: () => import('./views/register-jewelry/register-jewelry.vue') },
  { path: 'jewelry/certifications', name: 'jewelry-certifications', component: () => import('./views/certifications/certifications.vue') },
  { path: 'jewelry/reports',        name: 'jewelry-reports',        component: () => import('./views/reports/reports.vue') },
  { path: 'jewelry/mineral-origin', name: 'jewelry-mineral-origin', component: () => import('./views/mineral-origin/mineral-origin.vue') },
  { path: 'jewelry/purity',         name: 'jewelry-purity',         component: () => import('./views/purity-test/purity-test.vue') },
  { path: 'jewelry/subdivision',    name: 'jewelry-subdivision',    component: () => import('./views/subdivision/subdivision.vue') }
]
