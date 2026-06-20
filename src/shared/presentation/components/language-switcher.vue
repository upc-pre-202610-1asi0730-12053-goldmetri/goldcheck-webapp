<script setup>
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

function toggleLocale() {
  locale.value = locale.value === 'es' ? 'en' : 'es'
}
</script>

<template>
  <button class="lang-toggle" @click="toggleLocale" :aria-label="$t('nav.toggleLanguage')">
    <span :class="{ active: locale === 'en' }">EN</span>
    <span class="lang-sep" aria-hidden="true">|</span>
    <span :class="{ active: locale === 'es' }">ES</span>
  </button>
</template>

<style scoped>
.lang-toggle {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--gc-border);
  border-radius: 6px;
  padding: 0.3rem 0.7rem;
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
</style>
