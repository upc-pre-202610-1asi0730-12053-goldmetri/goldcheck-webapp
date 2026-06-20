<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useIamStore } from '../../../iam/application/iam.store.js'

const router   = useRouter()
const { locale, t } = useI18n()
const iamStore = useIamStore()

// ── Search ────────────────────────────────────────────────────────────────
const searchQuery = ref('')
const isFocused   = ref(false)

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
    { icon: 'pi pi-th-large',             label: t('common.sugDashboard'),    desc: t('common.sugDashboardDesc'),      to: '/app/fleet/dashboard' },
    { icon: 'pi pi-truck',                label: t('common.sugFleet'),         desc: t('common.sugFleetDesc'),          to: '/app/fleet/vehicles' },
    { icon: 'pi pi-server',               label: t('common.sugMaterial'),      desc: t('common.sugMaterialDesc'),       to: '/app/material/dashboard' },
    { icon: 'pi pi-exclamation-triangle', label: t('common.sugIncidents'),     desc: t('common.sugIncidentsDesc'),      to: '/app/incidents/dashboard' },
    { icon: 'pi pi-wifi',                 label: t('common.sugMonitoring'),    desc: t('common.sugMonitoringDesc'),     to: '/app/monitoring/dashboard' },
    { icon: 'pi pi-chart-bar',            label: t('common.sugAnalytics'),     desc: t('common.sugAnalyticsDesc'),      to: '/app/analytics/dashboard' },
    { icon: 'pi pi-file',                 label: t('common.sugReports'),       desc: t('common.sugReportsDesc'),        to: '/app/reporting/dashboard' },
  ]
  if (seg === 'jewelry') return [
    { icon: 'pi pi-th-large',  label: t('common.sugDashboard'),      desc: t('common.sugDashboardDesc'),       to: '/app/jewelry/dashboard' },
    { icon: 'pi pi-box',       label: t('common.sugInventory'),      desc: t('common.sugInventoryDesc'),       to: '/app/jewelry/inventory' },
    { icon: 'pi pi-sitemap',   label: t('common.sugMineralOrigin'),  desc: t('common.sugMineralOriginDesc'),   to: '/app/jewelry/mineral-origin' },
    { icon: 'pi pi-qrcode',    label: t('common.sugCertifications'), desc: t('common.sugCertificationsDesc'), to: '/app/jewelry/certifications' },
    { icon: 'pi pi-chart-bar', label: t('common.sugReports'),        desc: t('common.sugReportsDesc'),         to: '/app/jewelry/reports' },
  ]
  return [
    { icon: 'pi pi-th-large', label: t('common.sugCollection'),   desc: t('common.sugCollectionDesc'),   to: '/app/consumer/collection' },
    { icon: 'pi pi-search',   label: t('common.sugVerify'),       desc: t('common.sugVerifyDesc'),       to: '/app/consumer/verify' },
    { icon: 'pi pi-shield',   label: t('common.sugCertificates'), desc: t('common.sugCertificatesDesc'), to: '/app/consumer/certificates' },
  ]
})

const filteredSuggestions = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return allSuggestions.value
  return allSuggestions.value.filter(s =>
    s.label.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q)
  )
})

const showSearchDropdown = computed(() => isFocused.value && filteredSuggestions.value.length > 0)

function onFocus()  { isFocused.value = true }
function onBlur()   { setTimeout(() => { isFocused.value = false }, 150) }
function onEscape() { isFocused.value = false; searchQuery.value = '' }
function onEnter()  { if (filteredSuggestions.value.length) selectSuggestion(filteredSuggestions.value[0]) }

function selectSuggestion(item) {
  searchQuery.value = ''
  isFocused.value   = false
  router.push(item.to)
}

// ── Notifications ─────────────────────────────────────────────────────────
const showNotifPanel = ref(false)

const notifications = ref([
  { id: 1, icon: 'pi pi-exclamation-triangle', color: '#ef4444', titleKey: 'notif.alertRoute',    descKey: 'notif.alertRouteDesc',    time: '5m',  read: false },
  { id: 2, icon: 'pi pi-info-circle',          color: '#b2944e', titleKey: 'notif.newBatch',      descKey: 'notif.newBatchDesc',      time: '1h',  read: false },
  { id: 3, icon: 'pi pi-check-circle',         color: '#4ade80', titleKey: 'notif.weightOk',      descKey: 'notif.weightOkDesc',      time: '3h',  read: true  },
  { id: 4, icon: 'pi pi-shield',               color: '#b2944e', titleKey: 'notif.certReady',     descKey: 'notif.certReadyDesc',     time: '1d',  read: true  },
])

const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)

function toggleNotifPanel() {
  showNotifPanel.value = !showNotifPanel.value
}

function closeNotifPanel() {
  setTimeout(() => { showNotifPanel.value = false }, 150)
}

function markAllRead() {
  notifications.value.forEach(n => { n.read = true })
}

function markRead(id) {
  const n = notifications.value.find(n => n.id === id)
  if (n) n.read = true
}

function goToNotifSettings() {
  showNotifPanel.value = false
  router.push({ name: 'profile', query: { tab: 'notifications' } })
}

// ── User ──────────────────────────────────────────────────────────────────
const displayName = computed(() => iamStore.currentUser?.username || 'Usuario')
const initials    = computed(() => displayName.value.slice(0, 2).toUpperCase())

function toggleLocale() { locale.value = locale.value === 'es' ? 'en' : 'es' }
function goToProfile()  { router.push({ name: 'profile' }) }
</script>

<template>
  <header class="topbar" role="banner">

    <!-- Search -->
    <div class="topbar-search">
      <div class="search-box" role="search">
        <i class="pi pi-search" style="color:var(--gc-text-muted);font-size:0.8rem" aria-hidden="true" />
        <input
          v-model="searchQuery"
          :placeholder="searchPlaceholder"
          :aria-label="$t('common.search')"
          type="search"
          autocomplete="off"
          @focus="onFocus"
          @blur="onBlur"
          @keyup.escape="onEscape"
          @keyup.enter="onEnter"
        />
      </div>

      <div v-if="showSearchDropdown" class="search-dropdown" role="listbox" :aria-label="$t('common.searchSuggestions')">
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

    <!-- Actions -->
    <div class="topbar-actions">
      <button class="lang-toggle" @click="toggleLocale" :aria-label="$t('nav.toggleLanguage')">
        <span :class="{ active: locale === 'en' }">EN</span>
        <span class="lang-sep" aria-hidden="true">|</span>
        <span :class="{ active: locale === 'es' }">ES</span>
      </button>

      <!-- Notification bell -->
      <div class="notif-wrapper">
        <button
          class="topbar-icon-btn"
          :aria-label="$t('nav.notifications')"
          :aria-expanded="showNotifPanel"
          @click="toggleNotifPanel"
          @blur="closeNotifPanel"
        >
          <i class="pi pi-bell" aria-hidden="true" />
          <span v-if="unreadCount > 0" class="notif-dot" role="status" :aria-label="$t('nav.newNotifications')">
            {{ unreadCount > 9 ? '9+' : unreadCount }}
          </span>
        </button>

        <!-- Notification panel -->
        <div v-if="showNotifPanel" class="notif-panel" role="dialog" :aria-label="$t('nav.notifications')">
          <div class="notif-panel-header">
            <span class="notif-panel-title">{{ $t('nav.notifications') }}</span>
            <div style="display:flex;align-items:center;gap:0.4rem">
              <button v-if="unreadCount > 0" class="notif-action-btn" @click="markAllRead">
                {{ $t('nav.notifMarkAllRead') }}
              </button>
              <button class="notif-icon-btn" :aria-label="$t('nav.notifSettings')" v-tooltip.bottom="$t('nav.notifSettings')" @click="goToNotifSettings">
                <i class="pi pi-cog" />
              </button>
            </div>
          </div>

          <div class="notif-list">
            <button
              v-for="n in notifications"
              :key="n.id"
              class="notif-item"
              :class="{ 'notif-item--unread': !n.read }"
              @click="markRead(n.id)"
            >
              <i :class="n.icon" class="notif-item-icon" :style="{ color: n.color }" aria-hidden="true" />
              <span class="notif-item-body">
                <span class="notif-item-title">{{ $t(n.titleKey) }}</span>
                <span class="notif-item-desc">{{ $t(n.descKey) }}</span>
              </span>
              <span class="notif-item-time">{{ n.time }}</span>
              <span v-if="!n.read" class="notif-unread-dot" aria-hidden="true" />
            </button>
          </div>

          <div class="notif-panel-footer">
            <button class="notif-footer-link" @click="goToNotifSettings">
              <i class="pi pi-cog" style="font-size:0.75rem" />
              {{ $t('nav.notifSettings') }}
            </button>
          </div>
        </div>
      </div>

      <div class="topbar-divider" aria-hidden="true" />

      <div class="topbar-user" @click="goToProfile" role="button" tabindex="0" :aria-label="$t('nav.userMenu', { name: displayName })" @keyup.enter="goToProfile">
        <div class="user-avatar" aria-hidden="true">{{ initials }}</div>
        <span class="user-name">{{ displayName }}</span>
        <i class="pi pi-chevron-down" style="font-size:0.7rem;color:var(--gc-text-muted)" aria-hidden="true" />
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

/* ── Search ── */
.topbar-search { position: relative; flex: 1; max-width: 420px; }

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
.search-box:focus-within { border-color: var(--gc-gold-mid); }
.search-box input { flex:1; background:none; border:none; outline:none; color:var(--gc-text-primary); font-size:0.82rem; min-width:0; }
.search-box input::placeholder { color: var(--gc-text-muted); }

.search-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0; right: 0;
  background: var(--gc-dark-card);
  border: 1px solid var(--gc-border);
  border-radius: 10px;
  z-index: 200;
  padding: 0.5rem 0;
  box-shadow: 0 8px 24px rgba(0,0,0,0.4);
}
.search-dropdown-label {
  font-size: 0.65rem; font-weight: 700; letter-spacing: 0.1em;
  color: var(--gc-text-muted); text-transform: uppercase;
  padding: 0.2rem 0.9rem 0.4rem;
}
.search-suggestion {
  display: flex; align-items: center; gap: 0.75rem;
  width: 100%; padding: 0.55rem 0.9rem;
  background: none; border: none; cursor: pointer; text-align: left;
  transition: background 0.15s; color: var(--gc-text-primary);
}
.search-suggestion:hover { background: rgba(255,255,255,0.05); }
.sugg-icon { font-size: 0.85rem; color: var(--gc-gold-mid); width: 16px; flex-shrink: 0; }
.sugg-text { display: flex; flex-direction: column; gap: 0.1rem; flex: 1; min-width: 0; }
.sugg-label { font-size: 0.82rem; font-weight: 600; color: var(--gc-text-primary); }
.sugg-desc  { font-size: 0.73rem; color: var(--gc-text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sugg-arrow { font-size: 0.65rem; color: var(--gc-text-muted); flex-shrink: 0; }

/* ── Actions ── */
.topbar-actions { display: flex; align-items: center; gap: 0.5rem; }

.topbar-icon-btn {
  width: 36px; height: 36px;
  display: flex; align-items: center; justify-content: center;
  background: none; border: none; color: var(--gc-text-secondary);
  cursor: pointer; border-radius: 8px; position: relative;
  transition: color 0.2s, background 0.2s;
}
.topbar-icon-btn:hover { color: var(--gc-text-primary); background: rgba(255,255,255,0.06); }

.lang-toggle {
  display: flex; align-items: center; gap: 0.25rem;
  background: var(--gc-dark-card); border: 1px solid var(--gc-border);
  border-radius: 6px; padding: 0.25rem 0.6rem; cursor: pointer;
  font-size: 0.72rem; font-weight: 700; color: var(--gc-text-muted);
  letter-spacing: 0.06em; transition: border-color 0.2s;
}
.lang-toggle:hover { border-color: var(--gc-gold-mid); }
.lang-toggle span.active { color: var(--gc-gold-mid); }
.lang-sep { color: var(--gc-border); }

/* ── Notification bell + panel ── */
.notif-wrapper { position: relative; }

.notif-dot {
  position: absolute;
  top: 4px; right: 4px;
  min-width: 16px; height: 16px;
  border-radius: 8px;
  background: var(--gc-danger);
  color: #fff;
  font-size: 0.6rem;
  font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  padding: 0 3px;
  line-height: 1;
}

.notif-panel {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 320px;
  background: var(--gc-dark-card);
  border: 1px solid var(--gc-border);
  border-radius: 12px;
  z-index: 300;
  box-shadow: 0 12px 32px rgba(0,0,0,0.5);
  overflow: hidden;
}

.notif-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem 1rem 0.65rem;
  border-bottom: 1px solid var(--gc-border);
}

.notif-panel-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--gc-text-primary);
}

.notif-action-btn {
  font-size: 0.73rem;
  color: var(--gc-gold-mid);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}
.notif-action-btn:hover { text-decoration: underline; }

.notif-icon-btn {
  width: 24px; height: 24px;
  display: flex; align-items: center; justify-content: center;
  background: none; border: none;
  color: var(--gc-text-muted); cursor: pointer;
  border-radius: 6px; font-size: 0.85rem;
  transition: color 0.2s, background 0.2s;
}
.notif-icon-btn:hover { color: var(--gc-text-primary); background: rgba(255,255,255,0.07); }

.notif-list { max-height: 300px; overflow-y: auto; }

.notif-item {
  display: flex;
  align-items: flex-start;
  gap: 0.7rem;
  width: 100%;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  border-bottom: 1px solid var(--gc-border);
  cursor: pointer;
  text-align: left;
  transition: background 0.15s;
  position: relative;
}
.notif-item:last-child { border-bottom: none; }
.notif-item:hover { background: rgba(255,255,255,0.04); }
.notif-item--unread { background: rgba(178,148,78,0.05); }

.notif-item-icon { font-size: 1rem; margin-top: 0.1rem; flex-shrink: 0; }

.notif-item-body { display: flex; flex-direction: column; gap: 0.15rem; flex: 1; min-width: 0; }
.notif-item-title { font-size: 0.8rem; font-weight: 600; color: var(--gc-text-primary); }
.notif-item-desc  { font-size: 0.73rem; color: var(--gc-text-muted); line-height: 1.4; }

.notif-item-time {
  font-size: 0.68rem;
  color: var(--gc-text-muted);
  flex-shrink: 0;
  margin-top: 0.1rem;
}

.notif-unread-dot {
  position: absolute;
  top: 50%; right: 0.75rem;
  transform: translateY(-50%);
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--gc-gold-mid);
}

.notif-panel-footer {
  padding: 0.6rem 1rem;
  border-top: 1px solid var(--gc-border);
  display: flex;
  justify-content: flex-end;
}

.notif-footer-link {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.75rem;
  color: var(--gc-text-muted);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: color 0.2s;
}
.notif-footer-link:hover { color: var(--gc-text-secondary); }

/* ── Divider & user ── */
.topbar-divider { width: 1px; height: 24px; background: var(--gc-border); margin: 0 0.25rem; }

.topbar-user {
  display: flex; align-items: center; gap: 0.5rem;
  cursor: pointer; padding: 0.3rem 0.5rem; border-radius: 8px;
  transition: background 0.2s;
}
.topbar-user:hover { background: rgba(255,255,255,0.06); }

.user-avatar {
  width: 30px; height: 30px; border-radius: 50%;
  background: var(--gc-gold-mid); color: var(--gc-dark-3);
  display: flex; align-items: center; justify-content: center;
  font-size: 0.7rem; font-weight: 700;
}
.user-name { font-size: 0.875rem; font-weight: 500; }
</style>
