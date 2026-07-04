<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useJewelryStore } from '../../../application/jewelry.store.js'

const { t } = useI18n()
const store = useJewelryStore()

const massGrams      = ref(null)
const declaredKarats = ref(null)
const submitting     = ref(false)
const formError      = ref('')
const created        = ref(null)

onMounted(() => store.fetchItems())

// Only client-gold lots are listed here.
const clientLots = computed(() => store.materials.filter(m => m.source === 'Client'))

async function submit() {
  formError.value = ''
  created.value = null
  if (!massGrams.value || Number(massGrams.value) <= 0) { formError.value = t('jewelry.cgMassRequired'); return }

  submitting.value = true
  const res = await store.registerClientGold(Number(massGrams.value), declaredKarats.value ? Number(declaredKarats.value) : null)
  submitting.value = false

  if (res.ok) {
    created.value = res.material
    massGrams.value = null
    declaredKarats.value = null
  } else {
    formError.value = store.errors[0] === 'massRequired' ? t('jewelry.cgMassRequired') : t('jewelry.cgError')
  }
}
</script>

<template>
  <div class="gc-page">
    <div class="gc-page-header">
      <div>
        <h1 class="gc-page-title">{{ $t('jewelry.cgTitle') }}</h1>
        <p class="gc-page-subtitle">{{ $t('jewelry.cgSubtitle') }}</p>
      </div>
    </div>

    <div class="gc-card cg-card">
      <div v-if="created" class="gc-alert gc-alert-success">
        <i class="pi pi-check-circle" /> {{ $t('jewelry.cgCreated', { id: created.materialId, mass: created.massGrams }) }}
      </div>

      <div class="form-field">
        <label>{{ $t('jewelry.cgMass') }}</label>
        <input v-model.number="massGrams" type="number" min="0" step="0.01"
               class="gc-input-dark" :placeholder="$t('jewelry.cgMassPh')" @keyup.enter="submit" />
      </div>

      <div class="form-field">
        <label>{{ $t('jewelry.cgKarats') }}</label>
        <input v-model.number="declaredKarats" type="number" min="1" max="24"
               class="gc-input-dark" :placeholder="$t('jewelry.cgKaratsPh')" />
      </div>

      <span v-if="formError" class="field-error">{{ formError }}</span>

      <div class="actions">
        <button class="gc-btn gc-btn-gold" :disabled="submitting" @click="submit">
          <i v-if="submitting" class="pi pi-spin pi-spinner" />
          <i v-else class="pi pi-plus" />
          {{ $t('jewelry.cgRegister') }}
        </button>
      </div>
    </div>

    <div class="gc-card" style="margin-top:1.5rem" v-if="clientLots.length">
      <p class="gc-section-title">{{ $t('jewelry.cgListTitle') }}</p>
      <table class="gc-table">
        <thead>
          <tr>
            <th>{{ $t('jewelry.cgColLot') }}</th>
            <th>{{ $t('jewelry.cgColMass') }}</th>
            <th>{{ $t('jewelry.cgColKarats') }}</th>
            <th>{{ $t('jewelry.cgColSource') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="m in clientLots" :key="m.materialId">
            <td><span class="code-chip">{{ m.materialId }}</span></td>
            <td>{{ m.massGrams }} g</td>
            <td>{{ m.declaredKarats ? m.declaredKarats + 'k' : '—' }}</td>
            <td><span class="source-chip">{{ $t('jewelry.cgClientBadge') }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.gc-page-header { margin-bottom: 1.5rem; }
.cg-card { max-width: 480px; }
.gc-card { background: var(--gc-dark-card); border: 1px solid var(--gc-border); border-radius: 12px; padding: 1.5rem; }
.gc-section-title { font-size: 0.95rem; font-weight: 700; color: var(--gc-text-primary); margin-bottom: 1rem; }
.form-field { display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 1.1rem; }
.form-field label { font-size: 0.75rem; font-weight: 600; color: var(--gc-text-muted); text-transform: uppercase; letter-spacing: 0.06em; }
.gc-input-dark { width: 100%; box-sizing: border-box; padding: 0.6rem 0.8rem; background: var(--gc-dark-2); border: 1px solid var(--gc-border); border-radius: 8px; color: var(--gc-text-primary); font-size: 0.9rem; }
.gc-input-dark:focus { outline: none; border-color: var(--gc-gold-mid); }
.field-error { font-size: 0.78rem; color: var(--gc-danger); display: block; margin-bottom: 0.75rem; }
.actions { display: flex; justify-content: flex-end; margin-top: 0.5rem; padding-top: 1rem; border-top: 1px solid var(--gc-border); }
.gc-btn { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.55rem 1.1rem; border-radius: 8px; font-size: 0.85rem; font-weight: 600; cursor: pointer; border: none; }
.gc-btn-gold { background: var(--gc-gold-mid); color: #000; }
.gc-btn-gold:disabled { opacity: 0.5; cursor: not-allowed; }
.gc-table { width: 100%; border-collapse: collapse; }
.gc-table th { text-align: left; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--gc-text-muted); padding: 0.5rem 0.75rem; border-bottom: 1px solid var(--gc-border); }
.gc-table td { padding: 0.6rem 0.75rem; font-size: 0.85rem; color: var(--gc-text-primary); border-bottom: 1px solid var(--gc-border); }
.code-chip { background: rgba(178,148,78,.15); color: var(--gc-gold-mid); font-size: 0.75rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 20px; }
.source-chip { background: rgba(59,130,246,.15); color: #3b82f6; font-size: 0.72rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 20px; }
.gc-alert { display: flex; align-items: center; gap: 0.5rem; padding: 0.7rem 0.9rem; border-radius: 8px; font-size: 0.85rem; margin-bottom: 1.25rem; }
.gc-alert-success { background: rgba(74,222,128,.1); color: #4ade80; border: 1px solid rgba(74,222,128,.25); }
</style>
