export default [
  { path: 'consumer/collection',   name: 'consumer-collection',   component: () => import('./views/my-collection/my-collection.vue') },
  { path: 'consumer/verify',       name: 'consumer-verify',       component: () => import('./views/verify/verify.vue') },
  { path: 'consumer/certificates', name: 'consumer-certificates', component: () => import('./views/certificates/certificates.vue') }
]
