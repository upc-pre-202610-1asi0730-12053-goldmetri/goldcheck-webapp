<script setup>
const props = defineProps({
  label:       { type: String, required: true },
  value:       { type: [String, Number], required: true },
  trend:       { type: String,  default: '' },
  trendDown:   { type: Boolean, default: false },
  icon:        { type: String,  default: '' },
  alertActive: { type: Boolean, default: false }
})
</script>

<template>
  <div class="kpi-card" :class="{ 'alert-active': alertActive }">
    <p class="kpi-label">{{ label }}</p>
    <p class="kpi-value" :class="{ danger: alertActive }">{{ value }}</p>
    <p v-if="trend" class="kpi-trend" :class="{ down: trendDown }">
      <i :class="trendDown ? 'pi pi-arrow-down' : 'pi pi-arrow-up'" />
      {{ trend }}
    </p>
    <i v-if="icon" :class="icon" class="kpi-icon" />
  </div>
</template>
