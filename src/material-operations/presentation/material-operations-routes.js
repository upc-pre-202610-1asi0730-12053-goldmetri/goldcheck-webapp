export default [
  { path: 'material/dashboard', name: 'material-dashboard', component: () => import('./views/dashboard/dashboard.vue') },
  { path: 'material/typing',    name: 'material-typing',    component: () => import('./views/mineral-typing/mineral-typing.vue') },
  { path: 'material/shrinkage', name: 'material-shrinkage', component: () => import('./views/shrinkage/shrinkage.vue') }
]
