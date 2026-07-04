<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useJewelryStore } from '../../../application/jewelry.store.js'

const { t } = useI18n()
const store = useJewelryStore()

const selectedMaterialId = ref('')
const childMasses        = ref([null, null])
const submitting         = ref(false)
const formError          = ref('')
const createdChildren    = ref([])

onMounted(() => store.fetchItems())

// Only parent lots with a known mass can be subdivided.
const materials = computed(() => store.materials.filter(m => !m.parentMaterialId && m.massGrams))

const selected = computed(() => store.materials.find(m => m.materialId === selectedMaterialId.value) || null)
const totalChild = computed(() => childMasses.value.reduce((s, m) => s + (Number(m) || 0), 0))
const remaining  = computed(() => selected.value ? Number(selected.value.massGrams) - totalChild.value : 0)

function addChild() { childMasses.value.push(null) }
function removeChild(i) { if (childMasses.value.length > 1) childMasses.value.splice(i, 1) }

async function submit() {
  formError.value = ''
  createdChildren.value = []
  if (!selectedMaterialId.value) { formError.value = t('jewelry.subSelectError'); return }
  const masses = childMasses.value.map(Number).filter(m => m > 0)
  if (!masses.length) { formError.value = t('jewelry.subMassRequired'); return }

  submitting.value = true
  const res = await store.splitBatch(selectedMaterialId.value, masses)
  submitting.value = false

  if (res.ok) {
    createdChildren.value = res.children
    childMasses.value = [null, null]
  } else {
    const map = {
      splitExceedsMass: t('jewelry.subExceeds'),
      invalidMass:      t('jewelry.subInvalidMass'),
      splitError:       t('jewelry.subError'),
    }
    formError.value = map[store.errors[0]] || t('jewelry.subError')
  }
}
</script>

<template>
  <div class="gc-page">
    <div class="gc-page-header">
      <div>
        <h1 class="gc-page-title">{{ $t('jewelry.subTitle') }}</h1>
        <p class="gc-page-subtitle">{{ $t('jewelry.subSubtitle') }}</p>
      </div>
    </div>

    <div class="gc-card sub-card">
      <div v-if="createdChildren.length" class="gc-alert gc-alert-success">
        <i class="pi pi-check-circle" /> {{ $t('jewelry.subCreated', { count: createdChildren.length }) }}
      </div>

      <div class="form-field">
        <label>{{ $t('jewelry.subSelectMaterial') }}</label>
        <select v-model="selectedMaterialId" class="gc-input-dark">
          <option value="" disabled>{{ $t('jewelry.subSelectMaterialPh') }}</option>
          <option v-for="m in materials" :key="m.materialId" :value="m.materialId">
            {{ m.materialId }} — {{ m.massGrams }} g
          </option>
        </select>
        <p v-if="!materials.length" class="hint">{{ $t('jewelry.subNoMaterials') }}</p>
      </div>

      <div v-if="selected" class="mass-note" :class="{ over: remaining < 0 }">
        <i class="pi pi-info-circle" />
        {{ $t('jewelry.subMassNote', { total: selected.massGrams, used: totalChild.toFixed(2), left: remaining.toFixed(2) }) }}
      </div>

      <div class="form-field">
        <label>{{ $t('jewelry.subChildMasses') }}</label>
        <div v-for="(m, i) in childMasses" :key="i" class="child-row">
          <input v-model.number="childMasses[i]" type="number" min="0" step="0.01"
                 class="gc-input-dark" :placeholder="$t('jewelry.subChildPh', { n: i + 1 })" />
          <button class="icon-btn" @click="removeChild(i)" :disabled="childMasses.length <= 1"><i class="pi pi-times" /></button>
        </div>
        <button class="add-btn" @click="addChild"><i class="pi pi-plus" /> {{ $t('jewelry.subAddChild') }}</button>
      </div>

      <span v-if="formError" class="field-error">{{ formError }}</span>

      <div class="actions">
        <button class="gc-btn gc-btn-gold" :disabled="submitting" @click="submit">
          <i v-if="submitting" class="pi pi-spin pi-spinner" />
          {{ $t('jewelry.subSplit') }}
        </button>
      </div>
    </div>

    <div class="gc-card" style="margin-top:1.5rem" v-if="createdChildren.length">
      <p class="gc-section-title">{{ $t('jewelry.subChildrenTitle') }}</p>
      <table class="gc-table">
        <thead>
          <tr>
            <th>{{ $t('jewelry.subColSubCode') }}</th>
            <th>{{ $t('jewelry.subColMass') }}</th>
            <th>{{ $t('jewelry.subColParent') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in createdChildren" :key="c.materialId">
            <td><span class="code-chip">{{ c.materialId }}</span></td>
            <td>{{ c.massGrams }} g</td>
            <td>{{ c.parentMaterialId }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.gc-page-header { margin-bottom: 1.5rem; }
.sub-card { max-width: 560px; }
.gc-card { background: var(--gc-dark-card); border: 1px solid var(--gc-border); border-radius: 12px; padding: 1.5rem; }
.gc-section-title { font-size: 0.95rem; font-weight: 700; color: var(--gc-text-primary); margin-bottom: 1rem; }
.form-field { display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 1.1rem; }
.form-field label { font-size: 0.75rem; font-weight: 600; color: var(--gc-text-muted); text-transform: uppercase; letter-spacing: 0.06em; }
.gc-input-dark { width: 100%; box-sizing: border-box; padding: 0.6rem 0.8rem; background: var(--gc-dark-2); border: 1px solid var(--gc-border); border-radius: 8px; color: var(--gc-text-primary); font-size: 0.9rem; }
.gc-input-dark:focus { outline: none; border-color: var(--gc-gold-mid); }
.hint { font-size: 0.76rem; color: var(--gc-text-muted); margin: 0; }
.mass-note { display: flex; align-items: center; gap: 0.4rem; font-size: 0.78rem; color: var(--gc-gold-mid); margin: -0.4rem 0 1rem; }
.mass-note.over { color: var(--gc-danger); }
.child-row { display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.5rem; }
.icon-btn { background: none; border: 1px solid var(--gc-border); border-radius: 8px; color: var(--gc-text-muted); cursor: pointer; padding: 0.5rem 0.65rem; }
.icon-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.add-btn { background: none; border: none; color: var(--gc-gold-mid); cursor: pointer; font-size: 0.8rem; display: inline-flex; align-items: center; gap: 0.3rem; padding: 0.3rem 0; }
.field-error { font-size: 0.78rem; color: var(--gc-danger); display: block; margin-bottom: 0.75rem; }
.actions { display: flex; justify-content: flex-end; margin-top: 0.5rem; padding-top: 1rem; border-top: 1px solid var(--gc-border); }
.gc-btn { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.55rem 1.1rem; border-radius: 8px; font-size: 0.85rem; font-weight: 600; cursor: pointer; border: none; }
.gc-btn-gold { background: var(--gc-gold-mid); color: #000; }
.gc-btn-gold:disabled { opacity: 0.5; cursor: not-allowed; }
.gc-table { width: 100%; border-collapse: collapse; }
.gc-table th { text-align: left; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--gc-text-muted); padding: 0.5rem 0.75rem; border-bottom: 1px solid var(--gc-border); }
.gc-table td { padding: 0.6rem 0.75rem; font-size: 0.85rem; color: var(--gc-text-primary); border-bottom: 1px solid var(--gc-border); }
.code-chip { background: rgba(178,148,78,.15); color: var(--gc-gold-mid); font-size: 0.75rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 20px; }
.gc-alert { display: flex; align-items: center; gap: 0.5rem; padding: 0.7rem 0.9rem; border-radius: 8px; font-size: 0.85rem; margin-bottom: 1.25rem; }
.gc-alert-success { background: rgba(74,222,128,.1); color: #4ade80; border: 1px solid rgba(74,222,128,.25); }
</style>
