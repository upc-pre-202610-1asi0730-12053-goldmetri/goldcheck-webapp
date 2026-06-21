<script setup>
import { ref, computed } from 'vue'
import { useMineralStore } from '../../../application/mineral.store.js'
import { useAssetMaintenanceStore } from '../../../../asset-maintenance/application/asset-maintenance.store.js'

const emit = defineEmits(['close', 'created'])
const mineralStore = useMineralStore()
const assetStore   = useAssetMaintenanceStore()

const step = ref(1)
const step1Error = ref(false)
const createdBatch = ref(null)

const form = ref({ depositId: '', vehicleId: '' })

const simulatedWeight = ref(38.50)

const vehicleOptions = computed(() =>
  assetStore.machinery.map(m => ({ id: m.machineryId, label: `${m.name} (${m.machineryId})` }))
)

const selectedVehicleName = computed(() => {
  const m = assetStore.machinery.find(m => m.machineryId === form.value.vehicleId)
  return m?.name || form.value.vehicleId || '—'
})

const selectedDestination = computed(() => {
  const d = mineralStore.deposits.find(d => d.id === form.value.depositId)
  return d?.defaultDestination || 'Planta Principal'
})

async function goStep2() {
  step1Error.value = true
  if (!form.value.depositId || !form.value.vehicleId) return

  const batch = await mineralStore.createBatch(form.value.vehicleId, form.value.depositId)
  if (!batch) return
  createdBatch.value = batch
  step.value = 2
}

async function handleSeal() {
  if (!createdBatch.value) return
  await mineralStore.registerInitialWeight(createdBatch.value.id, simulatedWeight.value)
  emit('created', createdBatch.value)
}
</script>

<template>
  <!-- Modal Crear Nuevo Lote - US13 (Paso 1) + US14 (Paso 2) -->
  <pv-dialog
    :visible="true"
    @update:visible="v => !v && $emit('close')"
    :header="$t('mineral.createBatch')"
    :modal="true"
    :closable="true"
    :style="{ width: '500px' }"
  >
    <template #header>
      <span>
        <i class="pi pi-cube" style="color:var(--gc-gold-mid);margin-right:0.4rem" />
        {{ $t('mineral.createBatch') }}
        <small style="display:block;font-size:0.78rem;color:var(--gc-text-muted);font-weight:400">
          {{ step === 1 ? $t('mineral.step1') : $t('mineral.step2') }}
        </small>
      </span>
    </template>

    <!-- PASO 1: Yacimiento + Vehículo (US13) -->
    <div v-if="step === 1">
      <div class="form-field">
        <label for="deposit-select">{{ $t('mineral.selectDeposit') }}</label>
        <pv-select
          id="deposit-select"
          v-model="form.depositId"
          :options="mineralStore.deposits"
          option-label="name"
          option-value="id"
          :placeholder="$t('mineral.selectDeposit')"
          :invalid="step1Error && !form.depositId"
          fluid
        />
        <span v-if="step1Error && !form.depositId" class="gc-error-msg">{{ $t('mineral.depositRequired') }}</span>
      </div>

      <div class="form-field">
        <label for="vehicle-select">{{ $t('mineral.assignVehicle') }}</label>
        <pv-select
          id="vehicle-select"
          v-model="form.vehicleId"
          :options="vehicleOptions"
          option-label="label"
          option-value="id"
          :placeholder="$t('mineral.assignVehicle')"
          :invalid="step1Error && !form.vehicleId"
          fluid
        />
        <span v-if="step1Error && !form.vehicleId" class="gc-error-msg">{{ $t('mineral.vehicleRequired') }}</span>
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
        {{ $t('mineral.weightInvalid') }}
      </div>
    </div>

    <template #footer>
      <!-- Paso 1 footer -->
      <div v-if="step === 1" class="flex gap-2 justify-content-end">
        <pv-button :label="$t('mineral.cancel')" severity="secondary" outlined @click="$emit('close')" />
        <pv-button :label="$t('mineral.next')" icon="pi pi-arrow-right" icon-pos="right" @click="goStep2" />
      </div>
      <!-- Paso 2 footer -->
      <div v-else class="flex gap-2 justify-content-end">
        <pv-button :label="$t('mineral.back')" icon="pi pi-arrow-left" severity="secondary" outlined @click="step = 1" />
        <pv-button
          :label="$t('mineral.sealBatch')"
          icon="pi pi-lock"
          :loading="mineralStore.loading"
          @click="handleSeal"
        />
      </div>
    </template>
  </pv-dialog>
</template>

<style scoped>
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
