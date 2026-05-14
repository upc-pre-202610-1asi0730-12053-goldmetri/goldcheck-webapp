<template>
  <div class="app-shell">
    <SidebarNav />
    <div class="app-main">
      <TopBar />
      <main class="app-content">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router'
import SidebarNav from './sidebar-nav.vue'
import TopBar from './top-bar.vue'
</script>

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
}

.app-content {
  flex: 1;
  overflow-y: auto;
}
</style>
