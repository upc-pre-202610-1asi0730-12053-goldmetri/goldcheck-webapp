<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useJewelryStore } from '../../../application/jewelry.store.js'
import { useIamStore }     from '../../../../iam/application/iam.store.js'
import { materialOperationsApi } from '../../../../material-operations/infrastructure/material-operations-api.js'

const { t }    = useI18n()
const router   = useRouter()
const toast    = useToast()
const store    = useJewelryStore()
const iamStore = useIamStore()
const planLimit = ref(false)

function goToPlans() { router.push('/app/subscriptions/plans') }

const availableMaterials = ref([])
const selectedMaterialId = ref('')
const declaredKarats     = ref(null)
const massGrams          = ref(null)
const submitted          = ref(false)
const success            = ref(false)
const errorMsg           = ref('')
const loadingMaterials   = ref(false)

onMounted(async () => {
  loadingMaterials.value = true
  try {
    const res = await materialOperationsApi.getAllMaterials()
    availableMaterials.value = Array.isArray(res.data) ? res.data : []
  } catch {
    availableMaterials.value = []
  } finally {
    loadingMaterials.value = false
  }
})

async function handleSubmit() {
  submitted.value = true
  errorMsg.value  = ''
  if (!selectedMaterialId.value) return

  const jewelerId = String(iamStore.currentUser?.userId || '')
  if (!jewelerId) { errorMsg.value = t('jewelry.noUserError'); return }

  const result = await store.registerItem(
    selectedMaterialId.value, jewelerId,
    declaredKarats.value ? Number(declaredKarats.value) : null,
    massGrams.value ? Number(massGrams.value) : null
  )
  if (result) {
    success.value          = true
    planLimit.value        = false
    selectedMaterialId.value = ''
    declaredKarats.value   = null
    massGrams.value        = null
    submitted.value        = false
    setTimeout(() => { success.value = false }, 3000)
  } else if (store.errors[0] === 'planLimit') {
    planLimit.value = true
    errorMsg.value  = ''
    toast.add({ severity: 'warn', summary: t('jewelry.planLimitTitle'), detail: t('jewelry.planLimitMsg'), life: 5000 })
  } else {
    planLimit.value = false
    errorMsg.value  = t('jewelry.registerError')
  }
}
</script>

<template>
  <div class="gc-page">
    <div class="gc-page-header">
      <div>
        <h1 class="gc-page-title">{{ $t('jewelry.registerTitle') }}</h1>
        <p class="gc-page-subtitle">{{ $t('jewelry.registerSubtitle') }}</p>
      </div>
    </div>

    <div class="gc-card" style="max-width:480px">
      <form @submit.prevent="handleSubmit">

        <div class="form-field">
          <label for="material-select">{{ $t('jewelry.fieldMaterialId') }}</label>
          <div v-if="loadingMaterials" style="font-size:0.83rem;color:var(--gc-text-muted);padding:0.5rem 0">
            <i class="pi pi-spinner pi-spin" /> {{ $t('common.loading') }}
          </div>
          <select
            v-else
            id="material-select"
            v-model="selectedMaterialId"
            class="gc-input-dark"
            :class="{ 'gc-input-error': submitted && !selectedMaterialId }"
          >
            <option value="">{{ $t('jewelry.selectMaterial') }}</option>
            <option
              v-for="m in availableMaterials"
              :key="m.batchId"
              :value="m.batchId"
            >
              {{ m.batchId }} — {{ m.mineralType }} ({{ m.payloadTons }} t)
            </option>
          </select>
          <span v-if="submitted && !selectedMaterialId" class="gc-error-msg">{{ $t('jewelry.requiredField') }}</span>
          <p v-if="!loadingMaterials && availableMaterials.length === 0" style="font-size:0.8rem;color:var(--gc-text-muted);margin-top:0.4rem">
            {{ $t('jewelry.noMaterialsAvailable') }}
          </p>
        </div>

        <div class="form-field">
          <label for="declared-karats">{{ $t('jewelry.fieldDeclaredKarats') }}</label>
          <input id="declared-karats" v-model.number="declaredKarats" type="number" min="1" max="24"
                 class="gc-input-dark" :placeholder="$t('jewelry.declaredKaratsPh')" />
        </div>

        <div class="form-field">
          <label for="mass-grams">{{ $t('jewelry.fieldMassGrams') }}</label>
          <input id="mass-grams" v-model.number="massGrams" type="number" min="0" step="0.01"
                 class="gc-input-dark" :placeholder="$t('jewelry.massGramsPh')" />
        </div>

        <div v-if="errorMsg" class="gc-alert gc-alert-danger" style="margin-top:0.5rem">{{ errorMsg }}</div>

        <!-- Plan limit reached (HTTP 402) → clear alert + upgrade invitation -->
        <div v-if="planLimit" class="plan-limit-alert">
          <div class="pla-head"><i class="pi pi-lock" /> {{ $t('jewelry.planLimitTitle') }}</div>
          <p class="pla-desc">{{ $t('jewelry.planLimitMsg') }}</p>
          <pv-button :label="$t('jewelry.planLimitUpgrade')" icon="pi pi-star" size="small" @click="goToPlans" />
        </div>

        <div v-if="success" class="gc-alert gc-alert-success" style="margin-top:0.5rem">
          <i class="pi pi-check-circle" /> {{ $t('jewelry.registerSuccess') }}
        </div>

        <div style="display:flex;gap:0.75rem;justify-content:flex-end;margin-top:1.5rem">
          <button type="button" class="gc-btn gc-btn-outline" @click="$router.push({ name: 'jewelry-dashboard' })">
            {{ $t('common.cancel') }}
          </button>
          <button type="submit" class="gc-btn gc-btn-gold" :disabled="store.loading || loadingMaterials">
            <i class="pi pi-plus" /> {{ $t('jewelry.registerBtn') }}
          </button>
        </div>

      </form>
    </div>
  </div>
</template>

<style scoped>
.form-field { margin-bottom:1.25rem; }
.form-field label { display:block;font-size:0.82rem;color:var(--gc-text-secondary);margin-bottom:0.4rem; }
.gc-input-error { border-color: var(--gc-danger, #ef4444) !important; }
.gc-alert-success { background:rgba(74,222,128,0.1);color:#4ade80;border:1px solid rgba(74,222,128,0.25);padding:0.6rem 0.9rem;border-radius:6px;font-size:0.85rem;display:flex;align-items:center;gap:0.5rem; }
.plan-limit-alert { margin-top:0.75rem;padding:1rem;border-radius:10px;background:rgba(234,179,8,0.08);border:1px solid rgba(234,179,8,0.35); }
.pla-head { display:flex;align-items:center;gap:0.4rem;font-size:0.9rem;font-weight:700;color:#eab308; }
.pla-desc { font-size:0.82rem;color:var(--gc-text-secondary);margin:0.5rem 0 0.9rem; }
</style>
