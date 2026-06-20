<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useIamStore } from '../../../iam/application/iam.store.js'

const router   = useRouter()
const { locale, t } = useI18n()
const iamStore = useIamStore()

const searchQuery      = ref('')
const hasNotifications = ref(true)
const isFocused        = ref(false)

const searchPlaceholder = computed(() => {
  const seg = iamStore.currentUser?.segment
  if (seg === 'mining')   return t('common.searchMining')
  if (seg === 'jewelry')  return t('common.searchJewelry')
  if (seg === 'consumer') return t('common.searchConsumer')
  return t('common.search')
})

const allSuggestions = computed(() => {
  const seg = iamStore.currentUser?.segment
  if (seg === 'mining') return [
    { icon: 'pi pi-th-large',             label: t('common.sugDashboard'),   desc: t('common.sugDashboardDesc'),   to: '/app/fleet/dashboard' },
    { icon: 'pi pi-truck',                label: t('common.sugFleet'),        desc: t('common.sugFleetDesc'),       to: '/app/fleet/vehicles' },
    { icon: 'pi pi-server',               label: t('common.sugMaterial'),     desc: t('common.sugMaterialDesc'),    to: '/app/material/dashboard' },
    { icon: 'pi pi-exclamation-triangle', label: t('common.sugIncidents'),    desc: t('common.sugIncidentsDesc'),   to: '/app/incidents/dashboard' },
    { icon: 'pi pi-wifi',                 label: t('common.sugMonitoring'),   desc: t('common.sugMonitoringDesc'),  to: '/app/monitoring/dashboard' },
    { icon: 'pi pi-chart-bar',            label: t('common.sugAnalytics'),    desc: t('common.sugAnalyticsDesc'),   to: '/app/analytics/dashboard' },
    { icon: 'pi pi-file',                 label: t('common.sugReports'),      desc: t('common.sugReportsDesc'),     to: '/app/reporting/dashboard' },
  ]
  if (seg === 'jewelry') return [
    { icon: 'pi pi-th-large', label: t('common.sugDashboard'),      desc: t('common.sugDashboardDesc'),       to: '/app/jewelry/dashboard' },
    { icon: 'pi pi-box',      label: t('common.sugInventory'),      desc: t('common.sugInventoryDesc'),       to: '/app/jewelry/inventory' },
    { icon: 'pi pi-sitemap',  label: t('common.sugMineralOrigin'),  desc: t('common.sugMineralOriginDesc'),   to: '/app/jewelry/mineral-origin' },
    { icon: 'pi pi-qrcode',   label: t('common.sugCertifications'), desc: t('common.sugCertificationsDesc'), to: '/app/jewelry/certifications' },
    { icon: 'pi pi-chart-bar',label: t('common.sugReports'),        desc: t('common.sugReportsDesc'),         to: '/app/jewelry/reports' },
  ]
  return [
    { icon: 'pi pi-th-large', label: t('common.sugCollection'),    desc: t('common.sugCollectionDesc'),     to: '/app/consumer/collection' },
    { icon: 'pi pi-search',   label: t('common.sugVerify'),        desc: t('common.sugVerifyDesc'),         to: '/app/consumer/verify' },
    { icon: 'pi pi-shield',   label: t('common.sugCertificates'),  desc: t('common.sugCertificatesDesc'),   to: '/app/consumer/certificates' },
  ]
})

const filteredSuggestions = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return allSuggestions.value
  return allSuggestions.value.filter(s =>
    s.label.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q)
  )
})

const showDropdown = computed(() => isFocused.value && filteredSuggestions.value.length > 0)

function onFocus()       { isFocused.value = true }
function onBlur()        { setTimeout(() => { isFocused.value = false }, 150) }
function onEscape()      { isFocused.value = false; searchQuery.value = '' }

function selectSuggestion(item) {
  searchQuery.value = ''
  isFocused.value   = false
  router.push(item.to)
}

const displayName = computed(() => iamStore.currentUser?.username || 'Usuario')
const initials    = computed(() => displayName.value.slice(0, 2).toUpperCase())

function toggleLocale()      { locale.value = locale.value === 'es' ? 'en' : 'es' }
function goToProfile()       { router.push({ name: 'profile' }) }
function goToNotifications() { router.push({ name: 'profile', query: { tab: 'notifications' } }) }
</script>

<template>
  <header class="topbar" role="banner">
    <div class="topbar-search">
      <div class="search-box" role="search">
        <i class="pi pi-search" style="color: var(--gc-text-muted); font-size:0.8rem" aria-hidden="true" />
        <input
          v-model="searchQuery"
          :placeholder="searchPlaceholder"
          :aria-label="$t('common.search')"
          type="search"
          autocomplete="off"
          @focus="onFocus"
          @blur="onBlur"
          @keyup.escape="onEscape"
        />
      </div>

      <div v-if="showDropdown" class="search-dropdown" role="listbox" :aria-label="$t('common.searchSuggestions')">
        <p class="search-dropdown-label">{{ $t('common.searchCategories') }}</p>
        <button
          v-for="item in filteredSuggestions"
          :key="item.to"
          class="search-suggestion"
          role="option"
          @mousedown.prevent="selectSuggestion(item)"
        >
          <i :class="item.icon" class="sugg-icon" aria-hidden="true" />
          <span class="sugg-text">
            <span class="sugg-label">{{ item.label }}</span>
            <span class="sugg-desc">{{ item.desc }}</span>
          </span>
          <i class="pi pi-arrow-right sugg-arrow" aria-hidden="true" />
        </button>
      </div>
    </div>

    <div class="topbar-actions">
      <button class="lang-toggle" @click="toggleLocale" :aria-label="$t('nav.toggleLanguage')">
        <span :class="{ active: locale === 'en' }">EN</span>
        <span class="lang-sep" aria-hidden="true">|</span>
        <span :class="{ active: locale === 'es' }">ES</span>
      </button>
      <button class="topbar-icon-btn" :aria-label="$t('nav.notifications')" @click="goToNotifications">
        <i class="pi pi-bell" aria-hidden="true" />
        <span v-if="hasNotifications" class="notif-dot" role="status" :aria-label="$t('nav.newNotifications')" />
      </button>
      <div class="topbar-divider" aria-hidden="true" />
      <div class="topbar-user" @click="goToProfile" role="button" tabindex="0" :aria-label="$t('nav.userMenu', { name: displayName })" @keyup.enter="goToProfile">
        <div class="user-avatar" aria-hidden="true">{{ initials }}</div>
        <span class="user-name">{{ displayName }}</span>
        <i class="pi pi-chevron-down" style="font-size:0.7rem; color: var(--gc-text-muted)" aria-hidden="true" />
      </div>
    </div>
  </header>
</template>

<style scoped>
.topbar {
  height: 56px;
  background: var(--gc-dark);
  border-bottom: 1px solid var(--gc-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  flex-shrink: 0;
}

.topbar-search {
  position: relative;
  flex: 1;
  max-width: 420px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--gc-dark-2);
  border: 1px solid var(--gc-border);
  border-radius: 8px;
  padding: 0 0.75rem;
  height: 34px;
  transition: border-color 0.2s;
}

.search-box:focus-within {
  border-color: var(--gc-gold-mid);
}

.search-box input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  color: var(--gc-text-primary);
  font-size: 0.82rem;
  min-width: 0;
}

.search-box input::placeholder { color: var(--gc-text-muted); }

.search-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  background: var(--gc-dark-card);
  border: 1px solid var(--gc-border);
  border-radius: 10px;
  z-index: 200;
  padding: 0.5rem 0;
  box-shadow: 0 8px 24px rgba(0,0,0,0.4);
}

.search-dropdown-label {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--gc-text-muted);
  text-transform: uppercase;
  padding: 0.2rem 0.9rem 0.4rem;
}

.search-suggestion {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.55rem 0.9rem;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s;
  color: var(--gc-text-primary);
}

.search-suggestion:hover { background: rgba(255,255,255,0.05); }

.sugg-icon {
  font-size: 0.85rem;
  color: var(--gc-gold-mid);
  width: 16px;
  flex-shrink: 0;
}

.sugg-text {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  flex: 1;
  min-width: 0;
}

.sugg-label { font-size: 0.82rem; font-weight: 600; color: var(--gc-text-primary); }
.sugg-desc  { font-size: 0.73rem; color: var(--gc-text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.sugg-arrow { font-size: 0.65rem; color: var(--gc-text-muted); flex-shrink: 0; }

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.topbar-icon-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: var(--gc-text-secondary);
  cursor: pointer;
  border-radius: 8px;
  position: relative;
  transition: color 0.2s, background 0.2s;
}

.topbar-icon-btn:hover { color: var(--gc-text-primary); background: rgba(255,255,255,0.06); }

.lang-toggle {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: var(--gc-dark-card);
  border: 1px solid var(--gc-border);
  border-radius: 6px;
  padding: 0.25rem 0.6rem;
  cursor: pointer;
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--gc-text-muted);
  letter-spacing: 0.06em;
  transition: border-color 0.2s;
}
.lang-toggle:hover { border-color: var(--gc-gold-mid); }
.lang-toggle span.active { color: var(--gc-gold-mid); }
.lang-sep { color: var(--gc-border); }

.notif-dot {
  position: absolute;
  top: 6px; right: 6px;
  width: 7px; height: 7px;
  border-radius: 50%;
  background: var(--gc-danger);
}

.topbar-divider {
  width: 1px;
  height: 24px;
  background: var(--gc-border);
  margin: 0 0.25rem;
}

.topbar-user {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.3rem 0.5rem;
  border-radius: 8px;
  transition: background 0.2s;
}

.topbar-user:hover { background: rgba(255,255,255,0.06); }

.user-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--gc-gold-mid);
  color: var(--gc-dark-3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 700;
}

.user-name { font-size: 0.875rem; font-weight: 500; }
</style>
