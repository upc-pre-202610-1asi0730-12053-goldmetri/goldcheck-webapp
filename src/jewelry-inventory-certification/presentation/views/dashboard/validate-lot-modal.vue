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

<template>
  <pv-dialog
    :visible="true"
    @update:visible="v => !v && $emit('close')"
    :modal="true"
    :closable="true"
    :style="{ width: '480px' }"
  >
    <template #header>
      <span>
        <i class="pi pi-verified" style="color:var(--gc-gold-mid);margin-right:0.4rem" />
        {{ $t('jewelry.validateLot') }}
        <small style="display:block;font-size:0.78rem;color:var(--gc-text-muted);font-weight:400">
          {{ $t('jewelry.validateLotSubtitle') }}
        </small>
      </span>
    </template>

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
          <pv-checkbox v-model="check.done" :binary="true" :input-id="`check-${check.id}`" />
          <label :for="`check-${check.id}`" style="cursor:pointer">{{ check.label }}</label>
        </div>
      </div>

      <div v-if="jewelryStore.errors.length" class="gc-alert gc-alert-danger" style="margin-top:0.75rem">
        {{ $t('jewelry.validateError') }}
      </div>
    </div>

    <template #footer>
      <pv-button :label="$t('mineral.cancel')" severity="secondary" outlined @click="$emit('close')" />
      <pv-button
        :label="$t('jewelry.confirmValidation')"
        icon="pi pi-verified"
        :disabled="!allChecked"
        :loading="jewelryStore.loading"
        @click="handleValidate"
      />
    </template>
  </pv-dialog>
</template>

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

.validation-checklist { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 0.5rem; }

.check-row {
  display: flex; align-items: center; gap: 0.75rem;
  font-size: 0.85rem; color: var(--gc-text-secondary);
}
</style>
