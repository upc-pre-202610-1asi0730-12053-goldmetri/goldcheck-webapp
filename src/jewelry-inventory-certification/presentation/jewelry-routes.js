export default [
  { path: 'jewelry/dashboard',      name: 'jewelry-dashboard',      component: () => import('./views/dashboard/dashboard.vue') },
  { path: 'jewelry/inventory',      name: 'jewelry-inventory',      component: () => import('./views/inventory/inventory.vue') },
  { path: 'jewelry/register',       name: 'jewelry-register',       component: () => import('./views/register-jewelry/register-jewelry.vue') },
  { path: 'jewelry/certifications', name: 'jewelry-certifications', component: () => import('./views/certifications/certifications.vue') },
  { path: 'jewelry/reports',        name: 'jewelry-reports',        component: () => import('./views/reports/reports.vue') }
]
