<script setup>
import { ref } from 'vue'
import { RouterView } from 'vue-router'
import SidebarNav from './sidebar-nav.vue'
import TopBar from './top-bar.vue'
import AppFooter from './app-footer.vue'

const sidebarOpen = ref(false)
function toggleSidebar() { sidebarOpen.value = !sidebarOpen.value }
function closeSidebar()  { sidebarOpen.value = false }
</script>

<template>
  <div class="app-shell">
    <div
      v-if="sidebarOpen"
      class="mobile-overlay"
      aria-hidden="true"
      @click="closeSidebar"
    />

    <SidebarNav :open="sidebarOpen" @close="closeSidebar" />

    <div class="app-main">
      <div class="mobile-topbar">
        <button class="hamburger-btn" :aria-label="$t('nav.openMenu')" @click="toggleSidebar">
          <i class="pi pi-bars" />
        </button>
        <span class="mobile-logo">
          <span class="logo-hex">⬡</span> GoldMetrics
        </span>
      </div>

      <TopBar />
      <main class="app-content" role="main" id="main-content">
        <RouterView />
      </main>
      <AppFooter />
    </div>
  </div>
</template>

<style scoped>
.app-shell {
  display: flex;
  min-height: 100vh;
  background: var(--gc-dark-3);
}

.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
}

.app-content {
  flex: 1;
  overflow-y: auto;
}

.mobile-overlay {
  display: none;
}

.mobile-topbar {
  display: none;
}

@media (max-width: 768px) {
  .mobile-overlay {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.55);
    z-index: 99;
  }

  .mobile-topbar {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    background: var(--gc-dark);
    border-bottom: 1px solid var(--gc-border);
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .hamburger-btn {
    background: none;
    border: none;
    color: var(--gc-text-primary);
    font-size: 1.1rem;
    cursor: pointer;
    padding: 0.3rem;
    display: flex;
    align-items: center;
  }

  .mobile-logo {
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--gc-text-primary);
  }

  .mobile-logo .logo-hex {
    color: var(--gc-gold-mid);
    margin-right: 0.25rem;
  }
}
</style>
