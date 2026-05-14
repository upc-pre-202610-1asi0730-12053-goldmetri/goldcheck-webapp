<template>
  <header class="topbar">
    <div class="topbar-search">
      <div class="search-box">
        <i class="pi pi-search" style="color: var(--gc-text-muted); font-size:0.8rem" />
        <input :placeholder="searchPlaceholder" v-model="searchQuery" />
      </div>
    </div>

    <div class="topbar-actions">
      <button class="topbar-icon-btn" @click="toggleLocale">
        <i class="pi pi-globe" />
      </button>
      <button class="topbar-icon-btn">
        <i class="pi pi-bell" />
        <span v-if="hasNotifications" class="notif-dot" />
      </button>
      <div class="topbar-divider" />
      <div class="topbar-user" @click="goToProfile">
        <div class="user-avatar">{{ initials }}</div>
        <span class="user-name">{{ displayName }}</span>
        <i class="pi pi-chevron-down" style="font-size:0.7rem; color: var(--gc-text-muted)" />
      </div>
    </div>
  </header>
</template>

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
  if (seg === 'mining')  return 'Buscar lotes, vehículos...'
  if (seg === 'jewelry') return 'Buscar piezas, lotes...'
  return 'Buscar...'
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
</script>

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
