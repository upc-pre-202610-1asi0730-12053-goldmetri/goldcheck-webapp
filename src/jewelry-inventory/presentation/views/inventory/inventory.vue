<template>
  <div class="gc-page">
    <div class="gc-page-header">
      <div>
        <h1 class="gc-page-title">{{ $t('jewelry.inventoryTitle') }}</h1>
        <p class="gc-page-subtitle">{{ $t('jewelry.inventorySubtitle') }}</p>
      </div>
      <button class="gc-btn gc-btn-gold" @click="$router.push('/app/jewelry/register')">
        <i class="pi pi-plus" /> {{ $t('jewelry.registerItem') }}
      </button>
    </div>
    <div class="gc-card gc-coming-soon">
      <i class="pi pi-th-large" style="font-size:2.5rem;color:var(--gc-gold-mid);margin-bottom:1rem" />
      <p style="color:var(--gc-text-secondary)">{{ $t('common.comingSoon') }}</p>
    </div>
  </div>
</template>
<script setup></script>
<style scoped>
.gc-coming-soon { display:flex;flex-direction:column;align-items:center;justify-content:center;padding:4rem 2rem;text-align:center; }
</style>
