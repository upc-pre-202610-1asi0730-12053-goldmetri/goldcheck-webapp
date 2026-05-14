<template>
  <div class="gc-page">
    <div class="gc-page-header">
      <div>
        <h1 class="gc-page-title">{{ $t('consumer.verifyTitle') }}</h1>
        <p class="gc-page-subtitle">{{ $t('consumer.verifySubtitle') }}</p>
      </div>
    </div>
    <div class="gc-card verify-card">
      <i class="pi pi-qrcode" style="font-size:3rem;color:var(--gc-gold-mid);margin-bottom:1rem" />
      <input class="gc-input-dark" style="max-width:320px;margin-bottom:1rem" placeholder="Ingresa el código de trazabilidad" />
      <button class="gc-btn gc-btn-gold"><i class="pi pi-search" /> {{ $t('consumer.verifyBtn') }}</button>
    </div>
  </div>
</template>
<script setup></script>
<style scoped>
.verify-card { display:flex;flex-direction:column;align-items:center;padding:4rem 2rem;text-align:center; }
</style>
