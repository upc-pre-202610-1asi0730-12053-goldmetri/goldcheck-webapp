<template>
  <aside class="sidebar" role="complementary" :aria-label="$t('nav.sidebar')">
    <div class="sidebar-logo" aria-hidden="true">
      <span class="logo-hex">⬡</span>
      <span class="logo-text">GoldMetrics</span>
    </div>

    <nav class="sidebar-nav" role="navigation" :aria-label="$t('nav.mainNav')">
      <p class="sidebar-section-label" aria-hidden="true">{{ sectionLabel }}</p>
      <RouterLink
        v-for="item in navItems"
        :key="item.name"
        :to="item.to"
        class="sidebar-link"
        :class="{ active: isActive(item.to) }"
        :aria-current="isActive(item.to) ? 'page' : undefined"
        :aria-label="item.label"
      >
        <i :class="item.icon" class="sidebar-link-icon" aria-hidden="true" />
        {{ item.label }}
      </RouterLink>
    </nav>

    <button class="sidebar-logout" @click="logout" :aria-label="$t('nav.logout')">
      <i class="pi pi-sign-out" aria-hidden="true" />
      {{ $t('nav.logout') }}
    </button>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useIamStore } from '../../../iam/application/iam.store.js'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const route  = useRoute()
const router = useRouter()
const iamStore = useIamStore()

const segment = computed(() => iamStore.currentUser?.segment || 'mining')

const sectionLabel = computed(() => {
  const map = {
    mining:   t('common.segment.mining'),
    jewelry:  t('common.segment.jewelry'),
    consumer: t('common.segment.consumer')
  }
  return map[segment.value] || ''
})

const navItems = computed(() => {
  if (segment.value === 'mining') {
    return [
      { name: 'fleet-dashboard',      label: t('nav.dashboard'),       icon: 'pi pi-th-large',              to: '/app/fleet/dashboard' },
      { name: 'fleet-operations',     label: t('nav.operations'),      icon: 'pi pi-chart-line',            to: '/app/fleet/operations' },
      { name: 'fleet-vehicles',       label: t('nav.fleet'),           icon: 'pi pi-truck',                 to: '/app/fleet/vehicles' },
      { name: 'material-dashboard',   label: t('nav.materialOps'),     icon: 'pi pi-server',                to: '/app/material/dashboard' },
      { name: 'monitoring-dashboard', label: t('nav.monitoring'),      icon: 'pi pi-wifi',                  to: '/app/monitoring/dashboard' },
      { name: 'analytics-dashboard',  label: t('nav.analytics'),       icon: 'pi pi-chart-bar',             to: '/app/analytics/dashboard' },
      { name: 'incidents-dashboard',  label: t('nav.incidents'),       icon: 'pi pi-exclamation-triangle',  to: '/app/incidents/dashboard' },
      { name: 'reporting-dashboard',  label: t('nav.reports'),         icon: 'pi pi-file',                  to: '/app/reporting/dashboard' },
      { name: 'maintenance-dashboard',label: t('nav.maintenance'),     icon: 'pi pi-wrench',                to: '/app/maintenance/dashboard' },
      { name: 'subscriptions-plans',  label: t('nav.subscriptions'),   icon: 'pi pi-star',                  to: '/app/subscriptions/plans' },
      { name: 'profile',              label: t('nav.myProfile'),       icon: 'pi pi-user',                  to: '/app/profile' }
    ]
  }
  if (segment.value === 'jewelry') {
    return [
      { name: 'jewelry-dashboard',      label: t('nav.dashboard'),        icon: 'pi pi-th-large',  to: '/app/jewelry/dashboard' },
      { name: 'jewelry-inventory',      label: t('nav.inventory'),        icon: 'pi pi-box',       to: '/app/jewelry/inventory' },
      { name: 'jewelry-mineral-origin', label: t('nav.mineralOrigin'),    icon: 'pi pi-sitemap',   to: '/app/jewelry/mineral-origin' },
      { name: 'jewelry-certifications', label: t('nav.qrCertifications'), icon: 'pi pi-qrcode',   to: '/app/jewelry/certifications' },
      { name: 'jewelry-reports',        label: t('nav.reports'),          icon: 'pi pi-chart-bar', to: '/app/jewelry/reports' },
      { name: 'subscriptions-plans',    label: t('nav.subscriptions'),    icon: 'pi pi-star',      to: '/app/subscriptions/plans' },
      { name: 'profile',                label: t('nav.myProfile'),        icon: 'pi pi-user',      to: '/app/profile' }
    ]
  }
  // consumer
  return [
    { name: 'consumer-collection',   label: t('nav.myCollection'),  icon: 'pi pi-th-large', to: '/app/consumer/collection' },
    { name: 'consumer-verify',       label: t('nav.verifyJewel'),   icon: 'pi pi-search',   to: '/app/consumer/verify' },
    { name: 'consumer-certificates', label: t('nav.certificates'),  icon: 'pi pi-shield',   to: '/app/consumer/certificates' },
    { name: 'profile',               label: t('nav.myProfile'),     icon: 'pi pi-user',     to: '/app/profile' }
  ]
})

function isActive(path) {
  return route.path.startsWith(path)
}

function logout() {
  iamStore.logout()
  router.push({ name: 'login' })
}
</script>

<style scoped>
.sidebar {
  width: var(--gc-sidebar-w);
  min-height: 100vh;
  background: var(--gc-dark);
  display: flex;
  flex-direction: column;
  padding: 1.25rem 0;
  flex-shrink: 0;
  border-right: 1px solid var(--gc-border);
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0 1.25rem;
  margin-bottom: 2rem;
  font-size: 1rem;
  font-weight: 700;
  color: var(--gc-text-primary);
}

.logo-hex { font-size: 1.3rem; color: var(--gc-gold-mid); }

.sidebar-section-label {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: var(--gc-text-muted);
  text-transform: uppercase;
  padding: 0 1.25rem;
  margin-bottom: 0.5rem;
}

.sidebar-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.sidebar-link {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.6rem 1.25rem;
  font-size: 0.875rem;
  color: var(--gc-text-secondary);
  text-decoration: none;
  transition: color 0.2s, background 0.2s;
  margin: 0.1rem 0.5rem;
  border-radius: 8px;
}

.sidebar-link:hover { color: var(--gc-text-primary); background: rgba(255,255,255,0.05); }

.sidebar-link.active {
  background: var(--gc-gold-mid);
  color: var(--gc-dark-3);
  font-weight: 600;
}

.sidebar-link-icon { font-size: 0.9rem; width: 16px; }

.sidebar-logout {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.65rem 1.75rem;
  font-size: 0.875rem;
  color: var(--gc-text-muted);
  background: none;
  border: none;
  cursor: pointer;
  margin-top: 1rem;
  transition: color 0.2s;
}

.sidebar-logout:hover { color: var(--gc-danger); }
</style>
