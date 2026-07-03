<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMineralStore } from '../../../application/mineral.store.js'

const { t } = useI18n()
const store = useMineralStore()

const selectedCycleId = ref(null)
const driverId        = ref('')
const submitting      = ref(false)
const formError       = ref('')
const success         = ref(false)

onMounted(() => store.fetchBatches())

// Custody is assigned to cycles that are not yet completed.
const assignableCycles = computed(() =>
  store.batches.filter(b => b.status !== 'Completado')
)

async function submitAssign() {
  formError.value = ''
  success.value = false
  if (!selectedCycleId.value) { formError.value = t('mineral.custodySelectError'); return }

  submitting.value = true
  const res = await store.assignDriver(selectedCycleId.value, driverId.value)
  submitting.value = false

  if (res.ok) {
    success.value = true
    driverId.value = ''
    selectedCycleId.value = null
    setTimeout(() => { success.value = false }, 4000)
  } else {
    const map = {
      driverRequired: t('mineral.custodyDriverRequired'),
      driverBusy:     t('mineral.custodyDriverBusy'),
      driverError:    t('mineral.custodyError'),
    }
    formError.value = map[store.errors[0]] || t('mineral.custodyError')
  }
}
</script>

<template>
  <div class="gc-page">
    <div class="gc-page-header">
      <div>
        <h1 class="gc-page-title">{{ $t('mineral.custodyTitle') }}</h1>
        <p class="gc-page-subtitle">{{ $t('mineral.custodySubtitle') }}</p>
      </div>
    </div>

    <div class="gc-card custody-card">
      <div v-if="success" class="gc-alert gc-alert-success">
        <i class="pi pi-check-circle" /> {{ $t('mineral.custodySaved') }}
      </div>

      <div class="form-field">
        <label>{{ $t('mineral.custodySelectCycle') }}</label>
        <select v-model="selectedCycleId" class="gc-input-dark">
          <option :value="null" disabled>{{ $t('mineral.custodySelectCyclePh') }}</option>
          <option v-for="c in assignableCycles" :key="c.id" :value="c.id">
            {{ c.batchCode }} — {{ c.vehicleName }}<template v-if="c.driverId"> · {{ $t('mineral.custodyCurrentDriver', { driver: c.driverId }) }}</template>
          </option>
        </select>
        <p v-if="!assignableCycles.length" class="hint">{{ $t('mineral.custodyNoCycles') }}</p>
      </div>

      <div class="form-field">
        <label>{{ $t('mineral.custodyDriver') }}</label>
        <input
          v-model="driverId"
          type="text"
          class="gc-input-dark"
          :placeholder="$t('mineral.custodyDriverPh')"
          @keyup.enter="submitAssign"
        />
      </div>

      <span v-if="formError" class="field-error">{{ formError }}</span>

      <div class="actions">
        <button class="gc-btn gc-btn-gold" :disabled="submitting" @click="submitAssign">
          <i v-if="submitting" class="pi pi-spin pi-spinner" />
          {{ $t('mineral.custodyAssign') }}
        </button>
      </div>
    </div>

    <div class="gc-card" style="margin-top:1.5rem" v-if="store.batches.length">
      <p class="gc-section-title">{{ $t('mineral.custodyListTitle') }}</p>
      <table class="gc-table">
        <thead>
          <tr>
            <th>{{ $t('mineral.custodyColCycle') }}</th>
            <th>{{ $t('mineral.custodyColVehicle') }}</th>
            <th>{{ $t('mineral.custodyColDriver') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="b in store.batches" :key="b.id">
            <td>{{ b.batchCode }}</td>
            <td>{{ b.vehicleName }}</td>
            <td>
              <span v-if="b.driverId" class="driver-chip">{{ b.driverId }}</span>
              <span v-else class="no-driver">{{ $t('mineral.custodyUnassigned') }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.gc-page-header { margin-bottom: 1.5rem; }
.custody-card { max-width: 560px; }
.gc-card { background: var(--gc-dark-card); border: 1px solid var(--gc-border); border-radius: 12px; padding: 1.5rem; }
.gc-section-title { font-size: 0.95rem; font-weight: 700; color: var(--gc-text-primary); margin-bottom: 1rem; }

.form-field { display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 1.1rem; }
.form-field label { font-size: 0.75rem; font-weight: 600; color: var(--gc-text-muted); text-transform: uppercase; letter-spacing: 0.06em; }

.gc-input-dark { width: 100%; box-sizing: border-box; padding: 0.6rem 0.8rem; background: var(--gc-dark-2); border: 1px solid var(--gc-border); border-radius: 8px; color: var(--gc-text-primary); font-size: 0.9rem; transition: border-color 0.2s; }
.gc-input-dark:focus { outline: none; border-color: var(--gc-gold-mid); }

.hint { font-size: 0.76rem; color: var(--gc-text-muted); margin: 0; }
.field-error { font-size: 0.78rem; color: var(--gc-danger); display: block; margin-bottom: 0.75rem; }

.actions { display: flex; justify-content: flex-end; margin-top: 0.5rem; padding-top: 1rem; border-top: 1px solid var(--gc-border); }
.gc-btn { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.55rem 1.1rem; border-radius: 8px; font-size: 0.85rem; font-weight: 600; cursor: pointer; border: none; }
.gc-btn-gold { background: var(--gc-gold-mid); color: #000; }
.gc-btn-gold:disabled { opacity: 0.5; cursor: not-allowed; }

.gc-table { width: 100%; border-collapse: collapse; }
.gc-table th { text-align: left; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--gc-text-muted); padding: 0.5rem 0.75rem; border-bottom: 1px solid var(--gc-border); }
.gc-table td { padding: 0.6rem 0.75rem; font-size: 0.85rem; color: var(--gc-text-primary); border-bottom: 1px solid var(--gc-border); }

.driver-chip { background: rgba(178,148,78,.15); color: var(--gc-gold-mid); font-size: 0.75rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 20px; }
.no-driver { color: var(--gc-text-muted); font-size: 0.8rem; }

.gc-alert { display: flex; align-items: center; gap: 0.5rem; padding: 0.7rem 0.9rem; border-radius: 8px; font-size: 0.85rem; margin-bottom: 1.25rem; }
.gc-alert-success { background: rgba(74,222,128,.1); color: #4ade80; border: 1px solid rgba(74,222,128,.25); }
</style>
