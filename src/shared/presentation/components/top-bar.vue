<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useIamStore } from '../../../iam/application/iam.store.js'

const router = useRouter()
const { locale, t } = useI18n()
const iamStore = useIamStore()

const searchQuery = ref('')
const hasNotifications = ref(true)

const searchPlaceholder = computed(() => {
  const seg = iamStore.currentUser?.segment
  if (seg === 'mining')  return t('common.searchMining')
  if (seg === 'jewelry') return t('common.searchJewelry')
  return t('common.search')
})

const displayName = computed(() => iamStore.currentUser?.username || 'Usuario')
const initials = computed(() => {
  const name = displayName.value
  return name.slice(0, 2).toUpperCase()
})

function toggleLocale() {
  locale.value = locale.value === 'es' ? 'en' : 'es'
}

function goToProfile() {
  router.push({ name: 'profile' })
}

function goToNotifications() {
  router.push({ name: 'profile', query: { tab: 'notifications' } })
}
</script>

<template>
  <header class="topbar" role="banner">
    <div class="topbar-search">
      <div class="search-box" role="search">
        <i class="pi pi-search" style="color: var(--gc-text-muted); font-size:0.8rem" aria-hidden="true" />
        <input
          :placeholder="searchPlaceholder"
          v-model="searchQuery"
          :aria-label="$t('common.search')"
          type="search"
          autocomplete="off"
        />
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
