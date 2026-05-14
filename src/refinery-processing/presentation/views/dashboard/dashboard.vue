<template>
  <div class="gc-page">
    <div class="gc-page-header">
      <div>
        <h1 class="gc-page-title">{{ $t('refinery.dashboardTitle') }}</h1>
        <p class="gc-page-subtitle">{{ $t('refinery.dashboardSubtitle') }}</p>
      </div>
      <button class="gc-btn gc-btn-gold" @click="showModal = true">
        <i class="pi pi-plus" /> {{ $t('refinery.newReception') }}
      </button>
    </div>

    <div class="gc-card gc-coming-soon">
      <i class="pi pi-server" style="font-size:2.5rem;color:var(--gc-gold-mid);margin-bottom:1rem" />
      <p style="color:var(--gc-text-secondary)">{{ $t('common.comingSoon') }}</p>
    </div>

    <!-- Reception Modal stub -->
    <div v-if="showModal" class="gc-modal-overlay" @click.self="showModal = false">
      <div class="gc-modal" style="max-width:440px">
        <div class="gc-modal-header">
          <p class="gc-modal-title"><i class="pi pi-inbox" style="color:var(--gc-gold-mid);margin-right:0.4rem" />{{ $t('refinery.receptionModal') }}</p>
          <button class="gc-modal-close" @click="showModal = false">✕</button>
        </div>
        <p style="color:var(--gc-text-muted);font-size:0.85rem;padding:1rem 0">{{ $t('common.comingSoon') }}</p>
        <div class="gc-modal-footer">
          <button class="gc-btn gc-btn-outline" @click="showModal = false">{{ $t('mineral.cancel') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
const showModal = ref(false)
</script>
<style scoped>
.gc-coming-soon { display:flex;flex-direction:column;align-items:center;justify-content:center;padding:4rem 2rem;text-align:center; }
</style>
