<template>
  <div class="gc-modal-overlay" @click.self="$emit('close')">
    <div class="gc-modal" style="max-width:480px">

      <div class="gc-modal-header">
        <div>
          <p class="gc-modal-title">
            <i class="pi pi-verified" style="color:var(--gc-gold-mid);margin-right:0.4rem" />
            {{ $t('jewelry.validateLot') }}
          </p>
          <p class="gc-modal-subtitle">{{ $t('jewelry.validateLotSubtitle') }}</p>
        </div>
        <button class="gc-modal-close" @click="$emit('close')">✕</button>
      </div>

      <div v-if="item">
        <div class="item-preview">
          <div class="item-preview-icon"><i class="pi pi-star" /></div>
          <div>
            <div class="item-sku">{{ item.sku }}</div>
            <div class="item-name">{{ item.name }}</div>
            <div class="item-meta">{{ item.type }} · {{ item.purity }} · {{ item.weight }}g</div>
          </div>
        </div>

        <div class="validation-checklist">
          <div v-for="check in checks" :key="check.id" class="check-row" @click="check.done = !check.done">
            <div class="check-box" :class="{ checked: check.done }">
              <i v-if="check.done" class="pi pi-check" />
            </div>
            <span>{{ check.label }}</span>
          </div>
        </div>

        <div v-if="jewelryStore.errors.length" class="gc-alert gc-alert-danger" style="margin-top:0.75rem">
          {{ $t('jewelry.validateError') }}
        </div>
      </div>

      <div class="gc-modal-footer">
        <button class="gc-btn gc-btn-outline" @click="$emit('close')">{{ $t('mineral.cancel') }}</button>
        <button
          class="gc-btn gc-btn-gold"
          :disabled="!allChecked || jewelryStore.loading"
          @click="handleValidate"
        >
          <i v-if="jewelryStore.loading" class="pi pi-spinner pi-spin" />
          <i v-else class="pi pi-verified" />
          {{ $t('jewelry.confirmValidation') }}
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useJewelryStore } from '../../../application/jewelry.store.js'
import { useI18n } from 'vue-i18n'

const props = defineProps({ item: Object })
const emit  = defineEmits(['close', 'validated'])
const { t } = useI18n()
const jewelryStore = useJewelryStore()

const checks = ref([
  { id: 1, label: t('jewelry.check1'), done: false },
  { id: 2, label: t('jewelry.check2'), done: false },
  { id: 3, label: t('jewelry.check3'), done: false },
  { id: 4, label: t('jewelry.check4'), done: false },
])

const allChecked = computed(() => checks.value.every(c => c.done))

async function handleValidate() {
  const ok = await jewelryStore.validateItem(props.item.id)
  if (ok) emit('validated', props.item)
}
</script>

<style scoped>
.item-preview {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: rgba(178,148,78,0.08);
  border: 1px solid rgba(178,148,78,0.2);
  border-radius: 8px;
  margin-bottom: 1.25rem;
}

.item-preview-icon {
  width: 40px; height: 40px;
  border-radius: 50%;
  background: rgba(178,148,78,0.15);
  display: flex; align-items: center; justify-content: center;
  color: var(--gc-gold-mid); font-size: 1.1rem;
  flex-shrink: 0;
}

.item-sku  { font-size: 0.72rem; color: var(--gc-gold-mid); font-family: monospace; }
.item-name { font-size: 0.9rem; font-weight: 600; color: var(--gc-text-primary); }
.item-meta { font-size: 0.78rem; color: var(--gc-text-muted); margin-top: 0.15rem; }

.validation-checklist { display: flex; flex-direction: column; gap: 0.6rem; margin-bottom: 0.5rem; }

.check-row {
  display: flex; align-items: center; gap: 0.75rem;
  cursor: pointer; font-size: 0.85rem; color: var(--gc-text-secondary);
  padding: 0.4rem 0.5rem; border-radius: 6px;
  transition: background 0.15s;
}
.check-row:hover { background: rgba(255,255,255,0.04); }

.check-box {
  width: 18px; height: 18px; border-radius: 4px;
  border: 2px solid var(--gc-text-muted);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; font-size: 0.65rem; transition: all 0.2s;
}
.check-box.checked {
  background: var(--gc-gold-mid); border-color: var(--gc-gold-mid); color: #1a1a1a;
}
</style>
