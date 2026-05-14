<template>
  <div class="gc-page">
    <div class="gc-page-header">
      <div>
        <h1 class="gc-page-title">{{ $t('mineral.operationsTitle') }}</h1>
        <p class="gc-page-subtitle">{{ $t('mineral.operationsSubtitle') }}</p>
      </div>
    </div>
    <div class="gc-card gc-coming-soon">
      <i class="pi pi-cog" style="font-size:2.5rem;color:var(--gc-gold-mid);margin-bottom:1rem" />
      <p style="color:var(--gc-text-secondary)">{{ $t('common.comingSoon') }}</p>
    </div>
  </div>
</template>

<script setup></script>

<style scoped>
.gc-coming-soon {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}
</style>
