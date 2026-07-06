<script setup>
import { ref, computed } from 'vue'
import { useMineralStore } from '../../../application/mineral.store.js'
import { useMaterialOperationsStore } from '../../../../material-operations/application/material-operations.store.js'

const emit = defineEmits(['close', 'created'])
const mineralStore  = useMineralStore()
const materialStore = useMaterialOperationsStore()

const step = ref(1)
const step1Error = ref(false)
const step2Error = ref('')
const createdBatch = ref(null)

const form = ref({ depositId: '', vehicleId: '' })

const grossWeight = ref(38.50)

// US14 – the lote (batch) shares the hauling cycle id.
const loteId = computed(() => createdBatch.value ? (createdBatch.value.batchCode || String(createdBatch.value.id)) : '')

// US14 – vehicles come from the Fleet registry (they carry technical capacity).
const vehicleOptions = computed(() =>
  mineralStore.vehicles.map(v => ({ id: v.id, label: `${v.name} (${v.capacity} t)` }))
)

const selectedVehicle = computed(() =>
  mineralStore.vehicles.find(v => v.id === form.value.vehicleId) || null
)

const selectedVehicleName = computed(() => selectedVehicle.value?.name || form.value.vehicleId || '—')
const selectedCapacity    = computed(() => selectedVehicle.value?.capacity ?? null)

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
  step2Error.value = ''
  const cycleId   = createdBatch.value.id
  // Use the cycle's non-numeric code (e.g. "HC-14") as the batch id, consistent with the
  // Pesaje view. Keeps the material linked to the cycle without colliding with the cycle id.
  const batchCode = createdBatch.value.batchCode || String(cycleId)

  // US14 – ensure the lote exists in MaterialOperations before weighing (ACL-validated
  // on the backend). MineralType must match the backend's allowed set (Gold, Silver, Copper).
  const created = await materialStore.identifyMineral(batchCode, 'Gold', grossWeight.value)
  if (!created && materialStore.errors[0] !== 'materialExists') {
    step2Error.value = 'mineral.weighingError'
    return
  }

  const res = await mineralStore.registerInitialWeight(cycleId, grossWeight.value, batchCode)
  if (res.ok) {
    emit('created', { ...createdBatch.value, exceedsCapacity: res.exceedsCapacity })
    return
  }
  const code = mineralStore.errors[0]
  const map = {
    weightRequired: 'mineral.weighingWeightRequired',
    batchNotFound:  'mineral.weighingBatchNotFound',
    weightError:    'mineral.weighingError',
  }
  step2Error.value = map[code] || 'mineral.weighingError'
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

      <div v-if="selectedCapacity !== null && selectedCapacity > 0" class="capacity-note">
        <i class="pi pi-info-circle" />
        {{ $t('mineral.weighingCapacityInfo', { capacity: selectedCapacity }) }}
      </div>

      <div class="form-field" style="margin-top:1rem">
        <label>{{ $t('mineral.weighingBatchId') }}</label>
        <div class="lote-readonly">HC-{{ loteId }}</div>
      </div>

      <div class="form-field">
        <label for="gross-weight-input">{{ $t('mineral.weighingGrossWeight') }}</label>
        <pv-input-number
          id="gross-weight-input"
          v-model="grossWeight"
          :min-fraction-digits="2"
          :max-fraction-digits="2"
          :min="0"
          suffix=" t"
          fluid
        />
      </div>

      <div class="balance-note">
        <i class="pi pi-info-circle" style="flex-shrink:0;color:var(--gc-text-muted)" />
        {{ $t('mineral.balanceNote') }}
      </div>

      <div v-if="step2Error" class="gc-alert gc-alert-danger" style="margin-top:1rem">
        {{ $t(step2Error) }}
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

.capacity-note {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.78rem;
  color: var(--gc-gold-mid);
  margin-top: 0.75rem;
}

.lote-readonly {
  padding: 0.6rem 0.8rem;
  background: var(--gc-dark-2);
  border: 1px solid var(--gc-border);
  border-radius: 8px;
  color: var(--gc-text-primary);
  font-size: 0.9rem;
  font-weight: 600;
}
</style>
