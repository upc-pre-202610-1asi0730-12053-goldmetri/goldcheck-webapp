<template>
  <!-- Modal Crear Nuevo Lote - US13 (Paso 1) + US14 (Paso 2) -->
  <div class="gc-modal-overlay" @click.self="$emit('close')">
    <div class="gc-modal" style="max-width:500px">

      <!-- Header -->
      <div class="gc-modal-header">
        <div>
          <p class="gc-modal-title">
            <i class="pi pi-cube" style="color:var(--gc-gold-mid);margin-right:0.4rem" />
            {{ $t('mineral.createBatch') }}
          </p>
          <p class="gc-modal-subtitle">{{ step === 1 ? $t('mineral.step1') : $t('mineral.step2') }}</p>
        </div>
        <button class="gc-modal-close" @click="$emit('close')">✕</button>
      </div>

      <!-- PASO 1: Yacimiento + Vehículo (US13) -->
      <div v-if="step === 1">
        <div class="form-field">
          <label>{{ $t('mineral.selectDeposit') }}</label>
          <div class="select-wrapper">
            <i class="pi pi-map-marker select-icon" />
            <select v-model="form.depositId" class="gc-input-dark gc-select">
              <option value="" disabled>Ej: Yacimiento Las Bambas - Sector Sur</option>
              <option v-for="d in mineralStore.deposits" :key="d.id" :value="d.id">{{ d.name }}</option>
            </select>
            <i class="pi pi-chevron-down select-chevron" />
          </div>
          <span v-if="step1Error && !form.depositId" class="gc-error-msg">Selecciona un yacimiento.</span>
        </div>

        <div class="form-field">
          <label>{{ $t('mineral.assignVehicle') }}</label>
          <div class="select-wrapper">
            <i class="pi pi-truck select-icon" />
            <select v-model="form.vehicleId" class="gc-input-dark gc-select">
              <option value="" disabled>Ej: Camión CAT 01 (Placa: ABC-123)</option>
              <option v-for="v in mineralStore.vehicles" :key="v.id" :value="v.id">
                {{ v.name }} (Placa: {{ v.plate }})
              </option>
            </select>
            <i class="pi pi-chevron-down select-chevron" />
          </div>
          <span v-if="step1Error && !form.vehicleId" class="gc-error-msg">Selecciona un vehículo.</span>
        </div>

        <div class="gc-modal-footer">
          <button class="gc-btn gc-btn-outline" @click="$emit('close')">{{ $t('mineral.cancel') }}</button>
          <button class="gc-btn gc-btn-gold" @click="goStep2">
            {{ $t('mineral.next') }} <i class="pi pi-arrow-right" />
          </button>
        </div>
      </div>

      <!-- PASO 2: Captura de Pesaje (US14) -->
      <div v-else>
        <div class="step2-meta">
          <div><span class="meta-label">{{ $t('mineral.assignedVehicle') }}</span> {{ selectedVehicleName }}</div>
          <div><span class="meta-label">{{ $t('mineral.destinationLabel') }}</span> {{ selectedDestination }}</div>
        </div>

        <div class="balance-display" style="margin:1rem 0">
          <span class="balance-online-badge">
            <i class="pi pi-wifi" style="font-size:0.7rem" /> {{ $t('mineral.balanceOnline') }}
          </span>
          <div class="balance-value">
            {{ simulatedWeight.toFixed(2) }}
            <span class="balance-unit">{{ $t('mineral.tons') }}</span>
          </div>
        </div>

        <div class="balance-note">
          <i class="pi pi-info-circle" style="flex-shrink:0;color:var(--gc-text-muted)" />
          {{ $t('mineral.balanceNote') }}
        </div>

        <div v-if="mineralStore.errors.length" class="gc-alert gc-alert-danger" style="margin-top:1rem">
          Peso no válido. Verifica la balanza.
        </div>

        <div class="gc-modal-footer">
          <button class="gc-btn gc-btn-outline" @click="step = 1">
            <i class="pi pi-arrow-left" /> {{ $t('mineral.back') }}
          </button>
          <button class="gc-btn gc-btn-gold" @click="handleSeal" :disabled="mineralStore.loading">
            <i v-if="mineralStore.loading" class="pi pi-spinner pi-spin" />
            <i v-else class="pi pi-lock" />
            {{ $t('mineral.sealBatch') }}
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useMineralStore } from '../../../application/mineral.store.js'

const emit = defineEmits(['close', 'created'])
const mineralStore = useMineralStore()

const step = ref(1)
const step1Error = ref(false)
const createdBatch = ref(null)

const form = ref({ depositId: '', vehicleId: '' })

// Simulate a live scale reading
const simulatedWeight = ref(38.50)

const selectedVehicleName = computed(() => {
  const v = mineralStore.vehicles.find(v => v.id === form.value.vehicleId)
  return v?.name || '—'
})

const selectedDestination = computed(() => {
  const d = mineralStore.deposits.find(d => d.id === form.value.depositId)
  return d?.defaultDestination || 'Planta Principal'
})

async function goStep2() {
  step1Error.value = true
  if (!form.value.depositId || !form.value.vehicleId) return

  // US13 — crear el lote
  const batch = await mineralStore.createBatch(form.value.depositId, form.value.vehicleId)
  if (!batch) return
  createdBatch.value = batch
  step.value = 2
}

async function handleSeal() {
  if (!createdBatch.value) return
  // US14 — registrar peso inicial
  const ok = await mineralStore.registerInitialWeight(createdBatch.value.id, simulatedWeight.value)
  if (ok) emit('created', createdBatch.value)
}
</script>

<style scoped>
.select-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.gc-select {
  appearance: none;
  padding-left: 2.25rem;
  padding-right: 2.25rem;
  cursor: pointer;
}

.select-icon {
  position: absolute;
  left: 0.75rem;
  color: var(--gc-text-muted);
  font-size: 0.85rem;
  pointer-events: none;
}

.select-chevron {
  position: absolute;
  right: 0.75rem;
  color: var(--gc-text-muted);
  font-size: 0.75rem;
  pointer-events: none;
}

.form-field {
  margin-bottom: 1.25rem;
}

.form-field label {
  display: block;
  font-size: 0.82rem;
  color: var(--gc-text-secondary);
  margin-bottom: 0.5rem;
}

.step2-meta {
  display: flex;
  gap: 2rem;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.meta-label {
  color: var(--gc-text-muted);
  font-size: 0.8rem;
  display: block;
}
</style>
