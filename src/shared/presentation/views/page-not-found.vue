<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;gap:1rem">
    <span style="font-size:4rem">⬡</span>
    <h1>404</h1>
    <p style="color:var(--gc-text-secondary)">Página no encontrada</p>
    <RouterLink to="/" class="gc-btn gc-btn-gold" style="margin-top:1rem;padding:0.65rem 1.5rem;border-radius:8px;text-decoration:none">
      Volver al inicio
    </RouterLink>
  </div>
</template>
